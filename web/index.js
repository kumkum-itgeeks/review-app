// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import sql from 'mysql';
import reviewRoutes from './Routes/review.js'
import tableRoutes from './Routes/table.js'
import detailsRoute from './Routes/details.js'
import settingsRoute from './Routes/settings.js'
import { GraphQLClient } from 'graphql-request'


import bodyParser from "body-parser";


export const con = sql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "reviews",
  multipleStatements: true
});

con.connect(function (error) {
  if (error) {
    console.error(error);
  }
});


const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
const router = express.Router()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

// adding reviews from extension

app.get("/api/addReviews/:obj/:shop/:handle/:id", async (_req, res) => {


  const Obj = JSON.parse(_req.params.obj);
  const shop = JSON.parse(_req.params.shop).toLowerCase();
  const handle = _req.params.handle;
  const Id = _req.params.id;
  const shopName = (shop).trim().replaceAll(" ", "_").replaceAll("-", "_");
  const reviewTable = shopName + '_review'
  const detailsTable = shopName + '_details'
  const settingsTable = shopName + '_settings'
  var averageRating;
  var length;
  const Columns = (Object.keys(Obj))
  const Data = Object.values(Obj)
  const DataValue = Data.map(cat => `'${cat}'`).join(', ');

  const checkStatus = `Select settings FROM ${settingsTable} Where type='autopublish'`;
  const query = `INSERT INTO ${reviewTable} (${Columns}) VALUES (${DataValue});INSERT INTO ${detailsTable} (${Columns}) VALUES (${DataValue})`
  const enabledQuery = `INSERT INTO ${reviewTable} (${Columns} , reviewStatus) VALUES (${DataValue}, 'Published');INSERT INTO ${detailsTable} (${Columns} , reviewStatus) VALUES (${DataValue},'Published')`

  con.query(checkStatus, (err, results) => {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    let settingObj = (JSON.parse(results[0].settings));
    var reviewStatus = (settingObj.autopublish)

    if (reviewStatus === 'enabled') {
      con.query(enabledQuery, async (err, results) => {
        if (err) {
          return  res.status(400).send(JSON.stringify({'error' : err.message}))
         }
        await avgRating()

      });
    }
    else {
      con.query(query, async (err, results) => {
        if (err) {
          return  res.status(400).send(JSON.stringify({'error' : err.message}))
         }
        await avgRating()

      });
    }
  });

  async function avgRating() {

    //************** fetching average rating from db to store in metafield */
    const getAveragequery = ` SELECT starRating , reviewTitle FROM ${reviewTable} WHERE productHandle=${handle} AND reviewStatus='Published'`;
    con.query(getAveragequery, async (err, results) => {
      if (err) {
        return  res.status(400).send(JSON.stringify({'error' : err.message}))
       }
      else {
        let sum = 0;
        let rating = results.map((itm) => itm.starRating)
        length = results.length
        let totalRating = rating.forEach((itm) => {
          sum += itm;
        })
        averageRating = sum / length;
        await metafieldFunctionality()

      }
    });
  }

  async function metafieldFunctionality() {

    console.log('inside metafield functionality******')

    //****************** getting session data *******************/
    let completeShop = shop.trim().replaceAll(" ","-") + '.myshopify.com';
    var session;
    var RatingMetaId;
    var ReviewCountId;
    console.log(completeShop, 'complete shop')
    let getSessionQuery = `Select * from shopify_sessions WHERE shop='${completeShop}'`
    con.query(getSessionQuery, async (err, results) => {
      if (err) {
        return  res.status(400).send(JSON.stringify({'error' : err.message}))
       }

      session = results[0];
      console.log(session, 'session')

      var client = new shopify.api.clients.Graphql({ session });


      //****************************** retrieving metafield id ************************

      const getRatingMetaIdQuery = `query {
      product(id: "gid://shopify/Product/${Id}") {
        metafield(namespace: "itgeeks_reviews", key: "average_rating") {
          id
        }
      }
    }`

      const getCountMetaIdQuery = `query {
      product(id: "gid://shopify/Product/${Id}") {
        metafield(namespace: "itgeeks_reviews", key: "review_count") {
          id
        }
      }
    }`


      // Execute the rating  mutation
      try {
        const response = await client.query({
          data: {
            query: getRatingMetaIdQuery,
          },
        });

        const myData = await response.body;

        RatingMetaId = (Object(myData).data.product.metafield.id);

      } catch (error) {
        
          return  res.status(400).send(JSON.stringify({'error' : error.message}))
         
      }

      // Execute the count  mutation
      try {
        const response = await client.query({
          data: {
            query: getCountMetaIdQuery,
          },
        });

        const myData = await response.body;

        ReviewCountId = (Object(myData).data.product.metafield.id);

      } catch (error) {
      
          return  res.status(400).send(JSON.stringify({'error' : error.message}))
         
      }

      //****************** creating metafield *************************/
      console.log('here ====> 2')

      const createMetafieldMutation = `
      mutation {
        productUpdate(
          input : {
            id: "gid://shopify/Product/${Id}",
            metafields: [
              {
                namespace: "itgeeks_reviews",
                key: "average_rating",
                value: "${averageRating?.toFixed(1)}",
                type: "number_decimal",
              },
              {
                namespace: "itgeeks_reviews",
                key: "review_count",
                value: "${length}",
                type: "integer",
              }
            ]
          }) {
            product {
              metafields(first: 3) {
                edges {
                  node {
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
        }
        `

      //****************** updating my metafield *************************/

      const metafieldsWithId = [
        {
          id: `${RatingMetaId}`,
          value: `${averageRating?.toFixed(1)}`, // Default value for review count

        },
        {
          id: `${ReviewCountId}`,
          value: `${length}`, // Default value for review count

        },
      ];

      // Define the GraphQL mutation
      const UpdateMetafieldMutation = `mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
    product {
    id
    metafields(first: 10) {
    edges {
    node {
    namespace
    key
    value
    }
    }
    }
    }
    userErrors {
    field
    message
    }
    }
    }`;

      // Prepare the variables for the mutation
      const Metafieldvariables = {
        input: {
          id: `gid://shopify/Product/${Id}`, // Replace with actual product ID
          metafields: metafieldsWithId,
        },
      };


      // ************ checking if metafield exists or not //
      if (RatingMetaId === null || RatingMetaId === '' || RatingMetaId === undefined || ReviewCountId === null || ReviewCountId === '' || ReviewCountId === undefined) {
      console.log('here ====> 3')

        console.log(' creating metafield ***')
        try {
          const createResponse = await client.query({
            data: {
              query: createMetafieldMutation
            }
          });

          console.log('create mutation response ********', Object(createResponse).body.data.productUpdate.userErrors)

        } catch (error) {
          
            return  res.status(400).send(JSON.stringify({'error' : error.message}))
           
        }
      }

      else {
        // Execute the mutation

        try {
          const mutationResponse = await client.query({
            data: {
              query: UpdateMetafieldMutation,
              variables: Metafieldvariables,
            },
          });

          console.log('update mutation response *****', Object(mutationResponse).body.data.productUpdate.userErrors)


        } catch (error) {
         
            return  res.status(400).send(JSON.stringify({'error' : error.message}))
           
        }

      }

    })


  }

})



// const client = new shopify.api.clients.Graphql({ session });


app.get(`/api/getReviews/:shop/:handle/:page`, (req, res) => {

  var settingData;
  var reviewPerpage;
  var isLastPage;
  var length;
  var averageRating;
  const shop = JSON.parse(req.params.shop).toLowerCase();
  const productHandle = (req.params.handle);
  const pageNumber = Number(req.params.page);
  const shopName = (shop).trim().replaceAll(" ", "_").replaceAll("-", "_");
  const detailsTable = shopName + '_details'
  const settingsTable = shopName + '_settings'
  const type = ['starIconColor', 'reviewListingLayout', 'reviewListingText', 'reviewFormText', 'badgeText'];
  const typeValue = type.map(itm => `'${itm}'`).join(', ');
  const settingsQuery = `SELECT type , settings FROM ${settingsTable} WHERE type IN (${typeValue})`;
  const totoalDataquery = ` SELECT starRating , reviewTitle , userName , datePosted , reviewDescription , reply  FROM ${detailsTable} WHERE productHandle=${productHandle} AND reviewStatus='Published'`



  con.query(settingsQuery, (err, results) => {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    const transformedData = results.map(item => {
      const settingsObj = JSON.parse(item.settings);
      return { [item.type]: settingsObj };
    });

    settingData = transformedData
    reviewPerpage = (transformedData.filter((itm) => (itm.reviewListingLayout)).map((itm) => itm.reviewListingLayout.reviewPerpage).join(''))

    const limit = Number(reviewPerpage);
    const offset = Number((pageNumber - 1) * limit);

    const query = ` SELECT id ,starRating , reviewTitle , userName , datePosted , reviewDescription , reply , isInappropriate FROM ${detailsTable} WHERE productHandle=${productHandle} AND reviewStatus='Published' LIMIT ${limit} OFFSET ${offset}`;


    con.query(totoalDataquery, (err, results) => {
      if (err) {
        return  res.status(400).send(JSON.stringify({'error' : err.message}))
       }
      let sum = 0;
      let rating = results.map((itm) => itm.starRating)
      length = results.length
      let totalRating = rating.forEach((itm) => {
        sum += itm;
      })
      averageRating = sum / length;


      if (length < (limit + offset)) {
        isLastPage = true
      }
      else {
        isLastPage = false
      }
    });


    con.query(query, (err, results) => {
      if (err) {
        return  res.status(400).send(JSON.stringify({'error' : err.message}))
       }
      res.send(JSON.stringify({ reviews: results, length: length, averageRating: averageRating, settingData: settingData, isLastPage: isLastPage }));

    });
  });
  //
})




app.get("/api/checkReviewsOnload/:shop", async (_req, res) => {
  const shop = JSON.parse(_req.params.shop).toLowerCase();
  const settingsTable = (shop).trim().replaceAll(" ", "_").replaceAll("-", "_") + '_settings';

  const query = `SELECT settings from ${settingsTable} Where type ='reviewListingLayout' `;

  con.query(query, (err, results) => {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    else {
      let data = (results.map((itm) => itm.settings))
      let onLoad = (JSON.parse(data).reviewOnload)
      res.status(200).send(onLoad)

    }

  });
});


app.get("/api/reportInappropriate/:shop/:id", (req, res) => {

  const shop = JSON.parse(req.params.shop).toLowerCase();
  const shopName = (shop).trim().replaceAll(" ", "_").replaceAll("-", "_");
  const reviewTable =  shopName+ '_review';
  const detailsTable = shopName + '_details';
  const Id = req.params.id;



  const query = `UPDATE ${reviewTable} SET isInappropriate = 1 WHERE id = ${Id}; UPDATE ${detailsTable} SET isInappropriate = 1 WHERE id = ${Id}`
  con.query(query, (err, results) => {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    else {
      res.status(200).send(JSON.stringify(results))
    }

  });


})

// extension apis for rating extension ***************

// fetch review count and rating 

app.get("/api/getBadgeDetails/:shop/:handle", (req, res) => {

  const shop = JSON.parse(req.params.shop).toLowerCase();
  const handle = req.params.handle;
  const settingsTable = (shop).trim().replaceAll(" ", "_").replaceAll("-", "_") + '_settings';
  var averageRating;
  var length;



  const query = ` SELECT settings FROM ${settingsTable} WHERE type = 'badgeText'`;

  con.query(query, (err, results) => {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    else {
      let myData=(results[0].settings)
      // let ReviewsBadge=(results[0].settings.ReviewsBadge)
      
      res.status(200).send(JSON.stringify(myData))

    }
  });
})

// get star color from settings
app.get("/api/starColor/:shop", (req, res) => {

  const shop = JSON.parse(req.params.shop).toLowerCase();
  const settingTable = (shop).trim().replaceAll(" ", "_").replaceAll("-", "_") + '_settings';

  const query = ` SELECT settings FROM ${settingTable} WHERE type='starIconColor'`;

  con.query(query, (err, results) => {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    else {

      let data = (JSON.parse(results[0].settings))
      let color = (data.customColor)

      res.status(200).send(JSON.stringify({ color: color }))


    }
  });
})

app.get("/api/checkTableExists/:shop", (req, res) => {

  const shop = JSON.parse(req.params.shop).toLowerCase();
  const reviewTable = (shop).trim().replaceAll(" ", "_").replaceAll("-", "_") + '_review';

  const query = `SELECT * FROM information_schema.tables WHERE table_schema = 'reviews' AND table_name = '${reviewTable}'`;

  con.query(query, function (err, tables) {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    if (tables.length > 0) {
      res.send(JSON.stringify(true))
    }
    else {
      res.send(JSON.stringify(false))
    }
  })
}
)

app.get("/api/createAllTables/:shop", (req, res) => {

  const shop = JSON.parse(req.params.shop).toLowerCase();
  console.log('shop***8', shop)
  const shopName = (shop).trim().replaceAll(" ", "_").replaceAll("-", "_");
  const reviewTable = shopName+ '_review';
  const detailsTable = shopName + '_details'
  const SettingsTable = shopName + '_settings'
  const deletedTable = shopName + '_deleted_reviews'

  // let tableName = shopName + '_review'

  var createReviewTable = `CREATE TABLE IF NOT EXISTS ${reviewTable}  (
      id INT NOT NULL AUTO_INCREMENT,
      reviewTitle VARCHAR(200),
      reviewDescription LONGTEXT,
      userName VARCHAR(255),
      productid VARCHAR(100),
      productHandle VARCHAR(255),
      productTitle VARCHAR(255),
      Email VARCHAR(255) ,
      location VARCHAR(255) ,
      datePosted DATE DEFAULT NOW(),
      reviewStatus VARCHAR(255) DEFAULT 'Unpublished', 
      isSpam BOOLEAN DEFAULT 0,
      isInappropriate BOOLEAN DEFAULT 0,
      starRating INT(5),
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
      data JSON,
      PRIMARY KEY (id)
      )`;

  con.query(createReviewTable, function (err, tables) {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    else {
      console.log('review table created')
    }
  })



  var createDetailsTable = `CREATE TABLE IF NOT EXISTS ${detailsTable}  (
      id INT NOT NULL AUTO_INCREMENT,
      reviewTitle VARCHAR(200),
      reviewDescription LONGTEXT,
      userName VARCHAR(255),
      productid VARCHAR(100),
      productHandle VARCHAR(255),
      productTitle VARCHAR(255),
      Email VARCHAR(255) ,
      location VARCHAR(255) ,
      datePosted DATE DEFAULT NOW(),
      isSpam BOOLEAN DEFAULT 0,
      isInappropriate BOOLEAN DEFAULT 0,
      reviewStatus VARCHAR(255) DEFAULT 'Unpublished',
      starRating INT(5),
      reply LONGTEXT,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
      PRIMARY KEY (id)
      )`;
  con.query(createDetailsTable, function (err, result) {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    else {
      console.log( " details table created" );
    }

  });

  const addSettings = async() => {

  
    // if changing the json data after data is inserted once in default table  . It wont affect the data . and new data will
    // not be inserted .
    const jsonData =[
      {
        "type": "autopublish",
        "setting": { "autopublish": "enabled" }
      },
      {
        "type": "emailSettings",
        "setting": { "sendEmail": true, "email": "yourEmail@gmail.com" }
      },
      {
        "type": "starIconColor",
        "setting": { "isThemeColor": "customcolor", "customColor": "#FFFF00" }
      },
      {
        "type": "reviewListingLayout",
        "setting": {
          "reviewOnload": false,
          "bordercolor": "#5A5A5A",
          "dividercolor": "#e3e3e3",
          "reviewListingPadding": "45",
          "reviewPerpage": "4"
        }
      },
      {
        "type": "reviewListingText",
        "setting": {
          "reviewHeadline": "Customer Reviews",
          "reviewLink": "Write a Review Here",
          "noReviewSummary": "No reviews yet",
          "reviewSummary": "Based on ${length} reviews",
          "paginationNextLabel": "Next",
          "paginationPrevLabel": "Previous",
          "reportAsinappropriate": "Report as Inappropriate",
          "reportAsinappropriateMessage": "This review has been reported",
          "authorInformation": "<p><i><b>${itm.userName} </b> on <b>${itm.datePosted}</b></i></p>"
        }
      },
      {
        "type": "reviewFormText",
        "setting": {
          "authorEmail": "Email",
          "emailHelpMessage": "xyz@example.com...",
          "emailType": "required",
          "authorName": "Name",
          "nameHelpMessage": "Enter your name here",
          "nameType": "required",
          "authorLocation": "Location",
          "locationHelpMessage": "Enter your location here",
          "locationType": "hidden",
          "reviewFormTitle": "Write a Review",
          "reviewRating": "Rating",
          "reviewTitle": "Review Title",
          "reviewTitleHelpMessage": "Give your review a heading",
          "reviewBody": "Description of Review",
          "reviewBodyHelpMessage": "Write your description here",
          "submitButtton": "Submit Review",
          "successMessage": "Thank you for submitting a review!",
          "errorMessage": "Fields and rating can not be left empty."
        }
      },
      {
        "type": "badgeText",
        "setting": {
          "noReviewsBadge": "No reviews",
          "reviewsBadge": "${count} reviews"
        }
      }
    ]
  
    const types = jsonData.map((itm) => itm.type)
    const settingsArray = jsonData.map((itm) => itm.setting)
  
    var sql = `CREATE TABLE IF NOT EXISTS ${SettingsTable}  (
      id INT NOT NULL AUTO_INCREMENT,
      type VARCHAR(200),
      defaultSettings JSON,
      settings JSON,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
      PRIMARY KEY (id)
      )`;
  
    con.query(sql,  async (err, result) =>{
      if (err) {
        return  res.status(400).send(JSON.stringify({'error' : err.message}))
       }
      else{
        
        console.log(JSON.stringify("setting table created"));
        // res.send(JSON.stringify({message:"setting table created"}));
         await checkData()
      }
    });
    
  
    async function checkData(){
      let checkQuery = ` SELECT * from ${SettingsTable}`
      con.query(checkQuery, async(err, results) => {
        if (err) {
          return  res.status(400).send(JSON.stringify({'error' : err.message}))
         }
        else{
          if(results.length){
           console.log(JSON.stringify({message:"setting table and correct data exists ."}));
          }
          else{
            await addSettingdata()
          }
        }
      });
    }
  
    let query = `INSERT INTO ${SettingsTable} (type, defaultSettings , settings) VALUES ?`;
  
    const values = types.map((type, index) => [type, JSON.stringify(settingsArray[index]), JSON.stringify(settingsArray[index])]);
  
  
    async function addSettingdata(){
      
      con.query(query, [values], (err, results) => {
        if (err) {
          return  res.status(400).send(JSON.stringify({'error' : err.message}))
         }
        console.log(JSON.stringify({message:"Data inserted in settings table "}));
      });
    }
  
  }
  addSettings();

  var createDeletedReviewTable = `CREATE TABLE IF NOT EXISTS ${deletedTable}  (
    id INT NOT NULL AUTO_INCREMENT,
    reviewTitle VARCHAR(200),
    reviewDescription LONGTEXT,
    userName VARCHAR(255),
    productid VARCHAR(100),
    productHandle VARCHAR(255),
    productTitle VARCHAR(255),
    Email VARCHAR(255) ,
    location VARCHAR(255) ,
    datePosted DATE DEFAULT NOW(),
    isSpam BOOLEAN DEFAULT 0,
    isInappropriate BOOLEAN DEFAULT 0,
    reviewStatus VARCHAR(255) DEFAULT 'Unpublished',
    starRating INT(5),
    reply LONGTEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    PRIMARY KEY (id)
    )`;
  con.query(createDeletedReviewTable, function (err, result) {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    else {
      res.send(JSON.stringify({ message: 'export deleted review table created' }));
    }
  })
}
)



// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);



// Register webhooks after OAuth completes

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js



app.use("/api/*", shopify.validateAuthenticatedSession(), getShopName);

app.use(express.json());
app.use("/external/*", shopify.validateAuthenticatedSession(), getShopName);



async function getShopName(req, res, next) {

  const shop = await res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replaceAll("-", "_").trim();
  req.shopname = shopName;

  next()
  // Send the shopName or reviewTable back in the response
  // res.json({ shop, reviewTable });
}


// review middleware
app.use('/api/review', reviewRoutes);

//table middleware
app.use('/api/table', tableRoutes);
app.use('/external/table', tableRoutes);


// details middleware
app.use('/api/details', detailsRoute);

// settings middleware
app.use('/api/settings', settingsRoute);


////

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});


app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));



app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {

  // const shop = res.locals.shopify.session.shop;

  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
},);




app.listen(PORT);

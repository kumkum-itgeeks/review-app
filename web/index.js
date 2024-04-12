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
  const reviewTable = shop + '_review'
  const detailsTable = shop + '_details'
  const settingsTable = shop + '_settings'
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
      console.error('Error inserting reviews', err);
      return;
    }
    let settingObj = (JSON.parse(results[0].settings));
    var reviewStatus = (settingObj.autopublish)

    if (reviewStatus === 'enabled') {
      con.query(enabledQuery, async (err, results) => {
        if (err) {
          console.error('Error inserting reviews', err);
          return;
        }
        res.send(JSON.stringify('Data inserted successfully'));
        await avgRating()

      });
    }
    else {
      con.query(query, async (err, results) => {
        if (err) {
          console.error('Error inserting reviews', err);
          return;
        }
        res.send(JSON.stringify('Data inserted successfully'));
        await avgRating()

      });
    }
  });

  async function avgRating() {

    //************** fetching average rating from db to store in metafield */
    const getAveragequery = ` SELECT starRating , reviewTitle FROM ${reviewTable} WHERE productHandle=${handle} AND reviewStatus='Published'`;
    con.query(getAveragequery, async (err, results) => {
      if (err) {
        console.error('Error fetching reviews', err);
        return;
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

    //****************** getting session data *******************/
    let completeShop = shop + '.myshopify.com';
    var session;
    var RatingMetaId;
    var ReviewCountId;

    let getSessionQuery = `Select * from shopify_sessions WHERE shop='${completeShop}'`
    con.query(getSessionQuery, async (err, results) => {
      if (err) {
        console.error('err fetching session ', err)

      }


      session = results[0];

      let version = shopify.api.config.apiVersion
      let endpoint = `https://${shop}.myshopify.com/admin/api/${version}/graphql.json`;

      const client = new shopify.api.clients.Graphql({ session });


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
        console.error('erorrrrrr=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
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
        console.error('erorrrrrr=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
      }

      //****************** creating metafield *************************/
      
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
        
        //****************** updating my metafield *************************/

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
      if (RatingMetaId === null || RatingMetaId === '' || RatingMetaId === undefined || ReviewCountId === null || ReviewCountId === '' || ReviewCountId === undefined ) {

        console.log(' creating metafield **********************************************')
        try {
          const createResponse = await client.query({
            data: {
              query: createMetafieldMutation
            }
          });

          console.log('create mutation response ******************', Object(createResponse).body.data.productUpdate.userErrors)

        } catch (error) {
          console.error('erorrrrrr with create metafield =>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
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

          console.log('update mutation response ******************', Object(mutationResponse).body.data.productUpdate.userErrors)


        } catch (error) {
          console.error('erorrrrrr with update metafield =>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
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

  const detailsTable = shop + '_details'
  const settingsTable = shop + '_settings'
  const type = ['starIconColor', 'reviewListingLayout', 'reviewListingText', 'reviewFormText', 'badgeText'];
  const typeValue = type.map(itm => `'${itm}'`).join(', ');
  const settingsQuery = `SELECT type , settings FROM ${settingsTable} WHERE type IN (${typeValue})`;
  const totoalDataquery = ` SELECT starRating , reviewTitle , userName , datePosted , reviewDescription , reply  FROM ${detailsTable} WHERE productHandle=${productHandle} AND reviewStatus='Published'`



  con.query(settingsQuery, (err, results) => {
    if (err) {
      console.error('Error fetching data', err);
      return;
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
        console.error('Error retrieving data', err);
        return;
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
        console.error('Error retrieving data', err);
        return;
      }
      res.send(JSON.stringify({ reviews: results, length: length, averageRating: averageRating, settingData: settingData, isLastPage: isLastPage }));

    });
  });
  //
})




app.get("/api/checkReviewsOnload/:shop", async (_req, res) => {
  const shop = JSON.parse(_req.params.shop).toLowerCase();
  const settingsTable = shop + '_settings';

  const query = `SELECT settings from ${settingsTable} Where type ='reviewListingLayout' `;

  con.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching onload details', err);
      return;
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
  const reviewTable = shop + '_review';
  const detailsTable = shop + '_details';
  const Id = req.params.id;



  const query = `UPDATE ${reviewTable} SET isInappropriate = 1 WHERE id = ${Id}; UPDATE ${detailsTable} SET isInappropriate = 1 WHERE id = ${Id}`
  con.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching onload details', err);
      return;
    }
    else {
      res.status(200).send(JSON.stringify(results))
    }

  });


})

// extension apis for rating extension ***************

// fetch review count and rating 

app.get("/api/getReviewCount/:shop/:handle", (req, res) => {

  const shop = JSON.parse(req.params.shop).toLowerCase();
  const handle = req.params.handle;
  const reviewTable = shop + '_review';
  var averageRating;
  var length;



  const query = ` SELECT starRating , reviewTitle FROM ${reviewTable} WHERE productHandle=${handle} AND reviewStatus='Published'`;

  con.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching reviews', err);
      return;
    }
    else {
      //  res.status(200).send(JSON.stringify(results))
      let sum = 0;
      let rating = results.map((itm) => itm.starRating)
      length = results.length
      let totalRating = rating.forEach((itm) => {
        sum += itm;
      })
      averageRating = sum / length;
      res.status(200).send(JSON.stringify({ averageRating: averageRating, reviewCount: length }))

    }
  });
})

// get star color from settings
app.get("/api/starColor/:shop", (req, res) => {

  const shop = JSON.parse(req.params.shop).toLowerCase();
  const settingTable = shop + '_settings';

  const query = ` SELECT settings FROM ${settingTable} WHERE type='starIconColor'`;

  con.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching onload details', err);
      return;
    }
    else {

      let data = (JSON.parse(results[0].settings))
      let color = (data.customColor)

      res.status(200).send(JSON.stringify({ color: color }))


    }
  });
})




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


async function getShopName(req, res, next) {

  const shop = await res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replace("-", "_");
  req.shopname = shopName;

  next()
  // Send the shopName or reviewTable back in the response
  // res.json({ shop, reviewTable });
}

app.get('/api/createReviewTable', async (_req, res) => {

  const shop = res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replace("-", "_");
  let tableName = shopName + '_reviewss'

  var sql = `CREATE TABLE IF NOT EXISTS ${tableName}  (
    id INT NOT NULL AUTO_INCREMENT,
    reviewTitle VARCHAR(200),
    reviewDescription LONGTEXT,
    userName VARCHAR(255),
    productid INT(100),
    productHandle VARCHAR(255),
    datePosted DATE DEFAULT NOW(),
    reviewStatus VARCHAR(255),
    starRating VARCHAR(255),
    data JSON,
    PRIMARY KEY (id)
    )`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
    res.send(result);
  });

})

// review middleware
app.use('/api/review', reviewRoutes);

//table middleware
app.use('/api/table', tableRoutes);


// details middleware
app.use('/api/details', detailsRoute);

// settings middleware
app.use('/api/settings', settingsRoute);


////


/////

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

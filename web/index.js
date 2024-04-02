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

app.get("/api/addReviews/:obj/:shop", async (_req, res) => {

  const Obj = JSON.parse(_req.params.obj);
  const shop = JSON.parse(_req.params.shop).toLowerCase();
  const reviewTable = shop + '_review'
  const detailsTable = shop + '_details'
  const settingsTable = shop + '_settings'
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
      con.query(enabledQuery, (err, results) => {
        if (err) {
          console.error('Error inserting reviews', err);
          return;
        }
        res.send(JSON.stringify('Data inserted successfully'));
      });
    }
    else{
      con.query(query, (err, results) => {
        if (err) {
          console.error('Error inserting reviews',err);
          return;
        }
        res.send(JSON.stringify('Data inserted successfully'));
      });
    }
  });
});



app.get(`/api/getReviews/:shop/:id`, (req, res) => {

  const shop = JSON.parse(req.params.shop).toLowerCase();
  const productId = req.params.id;
  const detailsTable = shop + '_details'

  const query = ` SELECT starRating , reviewTitle , userName , datePosted , reviewDescription , reply  FROM ${detailsTable} WHERE productid=${productId} AND reviewStatus='Published'`;

  con.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving data', err);
      return;
    }
    let sum = 0;
    let rating = results.map((itm) => itm.starRating)
    let length = results.length
    let totalRating = rating.forEach((itm) => {
      sum += itm;
    })
    let averageRating = sum / length;
    console.log('length => ', length, 'avaerage rating =>', sum / length);
    res.send(JSON.stringify({ reviews: results, length: length, averageRating: averageRating }));

  });
})

app.get("/api/getSettingsData/:shop", async (_req, res) => {

  const shop = JSON.parse(_req.params.shop).toLowerCase();
  const settingsTable = shop + '_settings'
  const type =['starIconColor','reviewListingLayout', 'reviewListingText' , 'reviewFormText' , 'badgeText'];
  const typeValue = type.map(itm => `'${itm}'`).join(', ');

  const query=`SELECT type , settings FROM ${settingsTable} WHERE type IN (${typeValue})`;

  con.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data',err);
      return;
    }
    const transformedData = results.map(item => {
      const settingsObj = JSON.parse(item.settings);
      return { [item.type]: settingsObj };
    });

    // console.log(transformedData)
    res.status(200).send(JSON.stringify(transformedData))
  });
});


app.get("/api/checkReviewsOnload/:shop", async (_req, res) => {
  const shop = JSON.parse(_req.params.shop).toLowerCase();
  const settingsTable = shop + '_settings';

  const query =`SELECT settings from ${settingsTable} Where type ='reviewListingLayout' `;

  con.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching onload details',err);
      return;
    }
    else{
      let data=(results.map((itm)=>itm.settings))
      let onLoad=(JSON.parse(data).reviewOnload)
     res.status(200).send(onLoad)

    }
    
  });
});


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

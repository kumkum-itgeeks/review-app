import shopify from "../shopify.js";
import { con } from "../index.js";




const checkTableExists = (req, res) => {

  const reviewTable = req.shopname + '_review'
  const query = `SELECT * FROM information_schema.tables WHERE table_schema = 'reviews' AND table_name = '${reviewTable}'`;

  con.query(query, function (err, tables) {
    if (err) {
      throw err;
    }

    if (tables.length > 0) {
      res.send(JSON.stringify(true))
    }
    else {
      res.send(JSON.stringify(false))
    }

  })


}

// API , checking if Plan table exists or not ******
const checkPlanTableExists = (req, res) => {

  const shopName = req.shopname;
  const PlanTable = shopName + '_pricing_plan'
  const query = `SELECT * FROM information_schema.tables WHERE table_schema = 'reviews' AND table_name = '${PlanTable}'`;

  con.query(query, async function (err, tables) {
    if (err) {
      return res.status(400).send(JSON.stringify({ 'Error searching table': err }))
    }

    if (tables.length > 0) {
      await checkChargeId()
    }
    else {
      await createPlanTable()
    }

  })

  async function checkChargeId() {
    const query = `SELECT chargeId , planName FROM ${PlanTable} WHERE shop = '${shopName}'`;

    con.query(query, async function (err, result) {
      if (err) {
        return res.status(400).send(JSON.stringify({ 'error fetching chargeId': err.message }))
      }
      else {
      
        if (result[0] === undefined || result.length <= 0 || !result) {
          res.status(200).send(JSON.stringify({planExists : false , activePlan : 'No Plan'}));
        }
        else {
          
          const {planName} = result[0];
          res.status(200).send(JSON.stringify({planExists : true , activePlan : `${planName}`}));
        }
      }
    });

  }

  async function createPlanTable() {
    var sql = `CREATE TABLE IF NOT EXISTS ${PlanTable}  (
      id INT NOT NULL AUTO_INCREMENT,
      chargeId INT DEFAULT NULL,
      planName VARCHAR(255) DEFAULT NULL,
      shop VARCHAR(255) DEFAULT NULL ,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
      PRIMARY KEY (id)
      )`;

    con.query(sql, function (err, result) {
      if (err) {
        return res.status(400).send(JSON.stringify({ 'error': err.message }))
      }
      else {
        res.status(200).send(JSON.stringify({planExists : false , activePlan : 'No Plan'}));
      }
    });

  }

}

// API , adding Basic Plan
const addBasicPlan = (req, res) => {
   const shopName = req.shopname;
   const PlanTable = shopName + '_pricing_plan';
 

   const CheckPlanQuery = `SELECT * FROM ${PlanTable} WHERE shop ='${shopName}' `;
   const InsertPlanQuery  = `INSERT INTO ${PlanTable} (planName , shop) VALUES ('Basic Plan' , '${shopName}');`
   const UpdatePlanQuery  = `UPDATE  ${PlanTable} SET chargeId = Null , planName = 'Basic Plan' WHERE shop = '${shopName}' `


   con.query(CheckPlanQuery, async function (err, result) {
    if (err) {
      return res.status(400).send(JSON.stringify({ 'error checking plan': err.message }))
    }
    else {
      if(result[0]==='' , result.length <=0){
       await  InsertPlan()
      }
      else{
        await UpdatePlan()
      }
   
    }
  });

async function InsertPlan(){
  con.query(InsertPlanQuery, function (err, result) {
    if (err) {
      return res.status(400).send(JSON.stringify({ 'error adding plan ': err.message }))
    }
    else {
      res.status(200).send(JSON.stringify('Plan added succesfully'));
    }
  });
}

async function UpdatePlan(){
  con.query(UpdatePlanQuery, function (err, result) {
    if (err) {
      return res.status(400).send(JSON.stringify({ 'error updating plan ': err.message }))
    }
    else {
      res.status(200).send(JSON.stringify('Plan updated succesfully'));
    }
  });
}

}

//API , createSubscription 
const createSubscription = async(req , res) =>{
  const shopName = req.shopname;
  const session = res.locals.shopify.session;
  const client = new shopify.api.clients.Graphql({session});
 

  const lineItems=[
    {
      "plan":{
        "appRecurringPricingDetails": {
          "interval": "ANNUAL",
          "price": {
            "amount": "9",
            "currencyCode": "USD"
          }
        }
      }
    }
  ]
  
  const name ="newuser";
  const returnUrl = `https://admin.shopify.com/store/${shopName}/apps/reviews-82/plan`;
  const test = true;

 const SubscriptionCreateQuery = `
  mutation appSubscriptionCreate($lineItems: [AppSubscriptionLineItemInput!]!, $name: String!, $returnUrl: URL!, $test: Boolean!) {
    appSubscriptionCreate(lineItems: $lineItems, name: $name, returnUrl: $returnUrl, test: $test) {
      appSubscription {
        id
      }
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`;

  
  try{
    const response = await client.query({
      data:{
        query: SubscriptionCreateQuery,
        variables: {
          lineItems: lineItems,
          name: name,
          returnUrl: returnUrl,
          test: test,
        }
      }
    });
    if(response?.body?.data?.userErrors?.length >=1){

      await res.status(400).send(JSON.stringify({message : 'userError' , err : response.body.data.userErrors }))
    }
    else{
      await res.status(200).send(JSON.stringify({confirmationUrl : response?.body?.data?.appSubscriptionCreate?.confirmationUrl}))

    }
  }
  catch (error) {
    return  res.status(400).send(JSON.stringify({'error' : error.message}))
}

}


// API , adding Pro Plan
const addProPlan = async(req, res) => {
  const chargeId = req?.params?.chargeId;
  const shopName = req.shopname;
  const PlanTable = shopName + '_pricing_plan';
  const session = res.locals.shopify.session;
  const client = new shopify.api.clients.Graphql({session});
  var validId;
  const CheckPlanQuery = `SELECT * FROM ${PlanTable} WHERE shop ='${shopName}' `;
  const InsertPlanQuery  = `INSERT INTO ${PlanTable} (planName , shop , chargeId) VALUES ('Pro Plan' , '${shopName}' , ${chargeId})`
  const UpdatePlanQuery  = `UPDATE  ${PlanTable} SET chargeId = ${chargeId} , planName = 'Pro Plan' , shop = '${shopName}' WHERE shop = '${shopName}' `

  try{
    const response = await client.query({
      data: ` query {currentAppInstallation {
          activeSubscriptions {
            id
          }
       }
      }`
  });
  validId=((response?.body?.data?.currentAppInstallation?.activeSubscriptions[0].id)).slice(30)
  await addData(validId)
  }
  catch(error){
      console.log(error)
      return res.status(400).send(JSON.stringify({'error checking charge id' : error}))
    
  }

  




  async function addData(validId){
      if(Number(chargeId)===Number(validId)){
        con.query(CheckPlanQuery, async function (err, result) {
          if (err) {
            return res.status(400).send(JSON.stringify({ 'error checking plan': err.message }))
          }
          else {
            if(result[0]==='' , result.length <=0){
             await  InsertProPlan()
            }
            else{
              await UpdateProPlan()
            }
         
          }
        });

      }
      else{
        return res.status(400).send({message : 'your charge Id is invalid'})
      }
  }




async function InsertProPlan(){
  con.query(InsertPlanQuery, function (err, result) {
    if (err) {
      console.log(err)
      return res.status(400).send(JSON.stringify({ 'error updating plan ': err.message }))
    }
    else {
      res.status(200).send(JSON.stringify('Plan added succesfully'));
    }
  });
 
}

async function UpdateProPlan(){
 con.query(UpdatePlanQuery, function (err, result) {
   if (err) {
     return res.status(400).send(JSON.stringify({ 'error updating plan ': err.message }))
   }
   else {
     res.status(200).send(JSON.stringify('Plan updated succesfully'));
   }
 });
}

}

const createSettingsTable = (req, res) => {
  const SettingsTable = req.shopname + '_settings';

  var sql = `CREATE TABLE IF NOT EXISTS ${SettingsTable}  (
    id INT NOT NULL AUTO_INCREMENT,
    type VARCHAR(200),
    defaultSettings JSON,
    settings JSON,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    PRIMARY KEY (id)
    )`;

  con.query(sql, function (err, result) {
    if (err) {
      return res.status(400).send(JSON.stringify({ 'error': err.message }))
    }
    res.send(result);
  });

}

const createReviewsTable = async (_req, res) => {

  const shopName = _req.shopname;
  let tableName = shopName + '_review'

  var sql = `CREATE TABLE IF NOT EXISTS ${tableName}  (
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
  con.query(sql, function (err, result) {
    if (err) {
      return res.status(400).send(JSON.stringify({ 'error': err.message }))
    }
    else {
      res.send(JSON.stringify({ message: " review table created" }));
    }
  });

}

const createDetailTable = async (_req, res) => {

  const shopName = _req.shopname;
  let tableName = shopName + '_details'

  var sql = `CREATE TABLE IF NOT EXISTS ${tableName}  (
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
  con.query(sql, function (err, result) {
    if (err) {
      return res.status(400).send(JSON.stringify({ 'error': err.message }))
    }
    else {
      res.send(JSON.stringify({ message: " details table created" }));
    }

  });

}



const createMetafield = async (req, res) => {
  const session = res.locals.shopify.session;
  const client = new shopify.api.clients.Graphql({ session });

  // Define the metafields
  const metafields = [
    {
      namespace: 'reviews',
      key: 'review_count',
      value: '0', // Default value for review count
      type: 'integer',
    },
    {
      namespace: 'reviews',
      key: 'reviews',
      value: '[]', // Default value for reviews, assuming JSON format
      type: 'json_string',
    },
    {
      namespace: 'reviews',
      key: 'rating',
      value: '0', // Default value for rating
      type: 'integer',
    },
  ];

  // Define the GraphQL mutation
  const mutation = `mutation productUpdate($input: ProductInput!) {
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
  const variables = {
    input: {
      id: 'gid://shopify/Product/7214305837195', // Replace with actual product ID
      metafields: metafields,
    },
  };

  // Execute the mutation
  try {
    const response = await client.query({
      data: {
        query: mutation,
        variables: variables,
      },
    });
    res.send(JSON.stringify(response));
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const updateMetafields = async (req, res) => {

  const reviewIdArr = (req.params.id);
  const pidArr = (req.params.pid).split(',');
  const handleArray = (req.params.handle).split(',');
  const shop = req.shopname;
  var handle = [];
  var Id = [];
  const reviewTable = shop + '_review'
  var averageRating = [];
  var length = [];

  const session = res.locals.shopify.session;
  var client = new shopify.api.clients.Graphql({ session });

  if (pidArr == "null" || pidArr === '' || pidArr == "undefined") {

    const query = `SELECT productHandle , productid  FROM ${reviewTable} WHERE id IN (${reviewIdArr})`
    con.query(query, async (err, result) => {
      if (err) {
        return res.status(400).send(JSON.stringify({ 'error': err.message }))
      }
      else {
        result.map(async (objs) => {
          let { productHandle, productid } = objs;
          handle.push(productHandle)
          Id.push(productid)
        })
        await removeDuplicateHandles()
      }
    })

  }
  else {
    handle = handleArray;
    Id = pidArr;
    await removeDuplicateHandles()
  }



  async function removeDuplicateHandles() {
    let filteredHandles = handle.filter((item,
      index) => handle.indexOf(item) === index);
    await avgRating(filteredHandles)
  }

  async function avgRating(filteredHandles) {

    //************** fetching average rating from db to store in metafield */

    filteredHandles.map((itm, ind) => {


      const getAveragequery = ` SELECT starRating , reviewTitle FROM ${reviewTable} WHERE productHandle='${itm}' AND reviewStatus='Published'`;
      con.query(getAveragequery, async (err, results) => {
        if (err) {
          return res.status(400).send(JSON.stringify({ 'error': err.message }))
        }
        else {
          let sum = 0;
          if (!results || results.length <= 0 || results === '') {
            averageRating.push(0)
            length.push(0)
          }
          else {
            let rating = results.map((itm) => itm.starRating)
            let dataLength = results.length;
            length.push(dataLength)
            rating.forEach((itm) => {
              sum += itm;
            })
            averageRating.push((sum / dataLength).toFixed(1));
          }

          if (ind === (filteredHandles.length) - 1) {
            await removeDuplicateIds()
          }


        }
      });
    })
  }

  async function removeDuplicateIds() {
    let filteredIds = Id.filter((item,
      index) => Id.indexOf(item) === index);
    await metafieldFunctionality(filteredIds)
  }

  async function metafieldFunctionality(filteredIds) {


    var RatingMetaId;
    var ReviewCountId;

    try {
      const promises = filteredIds.map(async (itm) => {
        const response = await client.query({
          data: {
            query: `query {
                    product(id: "gid://shopify/Product/${itm}") {
                      metafield(namespace: "itgeeks_reviews", key: "average_rating") {
                        id
                      }
                    }
                  }`,
          },
        });

        const myData = await response?.body;
        return Object(myData)?.data?.product?.metafield?.id;
      });

      const RatingMetaIds = await Promise.all(promises);
      RatingMetaId = (RatingMetaIds)

    } catch (error) {

      return res.status(400).send(JSON.stringify({ 'error': error.message }))

    }

    //********* retrieveing count meta id  *****************//
    try {
      const promises = filteredIds.map(async (itm) => {
        const response = await client.query({
          data: {
            query: `query {
                    product(id: "gid://shopify/Product/${itm}") {
                      metafield(namespace: "itgeeks_reviews", key: "review_count") {
                        id
                      }
                    }
                  }`,
          },
        });

        const myData = await response?.body;
        return Object(myData)?.data?.product?.metafield?.id;
      });

      const countMetaIds = await Promise.all(promises);
      ReviewCountId = (countMetaIds)

    } catch (error) {

      return res.status(400).send(JSON.stringify({ 'error': error.message }))

    }


    //****************** updating my metafield *************************/

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

    PerformMetaFunctionality();
    async function PerformMetaFunctionality() {

      try {
        const mutationResponses = await Promise.all(RatingMetaId.map(async (id, ind) => {
          const response = await client.query({
            data: {
              query: UpdateMetafieldMutation,
              variables: {
                input: {
                  id: `gid://shopify/Product/${filteredIds[ind]}`, // Use the correct product ID here
                  metafields: [
                    {
                      id: `${(id)}`,
                      value: `${Number(averageRating[ind]).toFixed(1)}`,
                    },
                    {
                      id: `${(ReviewCountId[ind])}`,
                      value: `${(length[ind])}`
                    }
                  ]

                }
              }
            }
          });
          return response; // Return the response from each query
        }));

        console.log('Update Mutation UserErros ==>>:', mutationResponses.map((Res) => Object(Res).body.data.productUpdate.userErrors));
        await res.status(200).send(JSON.stringify({ message: 'Metafields updated succesfully' }))
      } catch (error) {

        return res.status(400).send(JSON.stringify({ 'error': error.message }))

      }

    }
  }

};

const createDeletedReviewsTable = async (req, res) => {

  const shopName = req.shopname;
  const deletedTable = shopName + '_deleted_reviews'
  var sql = `CREATE TABLE IF NOT EXISTS ${deletedTable}  (
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
  con.query(sql, function (err, result) {
    if (err) {
      return res.status(400).send(JSON.stringify({ 'error': err.message }))
    }
    else {
      res.send(JSON.stringify({ message: 'export deletd review table created' }));
    }
  })
}


export default { createReviewsTable, createDetailTable, addProPlan, createSubscription ,  checkPlanTableExists, addBasicPlan, createMetafield, updateMetafields, createSettingsTable, createDeletedReviewsTable, checkTableExists }
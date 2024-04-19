import shopify from "../shopify.js";
import { con } from "../index.js";


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
    if (err) throw err;
    console.log(JSON.stringify("setting table created"));
    res.send(result);
  });

}
const createReviewsTable = async (_req, res) => {

  const shop = await res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replace("-", "_");
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
    if (err) throw err;
    console.log(JSON.stringify("Review Table created"));
    res.send(result);
  });

}

const createDetailTable = async (_req, res) => {

  const shop = await res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replace("-", "_");
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
    if (err) throw err;
    res.send(JSON.stringify('detail table created'));
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
    const shop = req.shopname;
    var handle = [];
    var  Id = [];
    const reviewTable = shop + '_review'
    var averageRating = [];
    var length = [];
  
    const session = res.locals.shopify.session;
    var client = new shopify.api.clients.Graphql({ session });
  

    console.log('review id array ===>> ' , reviewIdArr)
    const query = `SELECT productHandle , productid  FROM ${reviewTable} WHERE id IN (${reviewIdArr})`
    con.query(query , async (err , result )=>{
      if(err){
        console.error('error fetching product handle , product id', err)
      }
      else{
        result.map(async (objs)=>{
          let {productHandle , productid} =  objs;
          handle.push(productHandle)
          Id.push(productid)
        })
        await removeDuplicateHandles()
      }
    })

  
    async function removeDuplicateHandles() {
      console.log("productHandles ==>" , handle)
      console.log("Ids ==>" , Id)
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
            console.error('Error fetching reviews', err);
            return;
          }
          else {
            let sum = 0;
            let rating = results.map((itm) => itm.starRating)
            let dataLength = results.length;
            length.push(dataLength)
            rating.forEach((itm) => {
              sum += itm;
            })
            averageRating.push((sum / dataLength).toFixed(1));
  
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
        console.error('erorrrrrr=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
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
        console.error('erorrrrrr=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
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
              const mutationResponses = await Promise.all(RatingMetaId.map(async (id , ind) => {
                console.log(filteredIds[ind], 'piddd.......')
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
              await res.status(200).send(JSON.stringify({message:'Metafields updated succesfully'}))
            } catch (error) {
              console.error('Error updating metafields ==>>:', error.message);
            }
    
          }
        }
  
};


// const updateMetafields = async (req, res) => {

//   const reviewId = req.params.id;
//   const reviewTable = req.shopname + '_review';
//   const session = res.locals.shopify.session;
//   var client = new shopify.api.clients.Graphql({ session });
//   var length;
//   var averageRating;
//   var RatingMetaId;
//   var ReviewCountId;
//   var handle;
//   var Id;

//   const getHandlequery = `Select productid , productHandle FROM ${reviewTable} WHERE id = ${reviewId}`;

//   con.query(getHandlequery, async (err , result)=>{
//     if (err){
//       console.error('error fetching productHandle' , err)
//     }
//     else{
//       Id=(result[0]?.productid)
//       handle=(result[0]?.productHandle)
//       console.log('review id ' , reviewId)
//       console.log('handle ', result)
//       await calculateAverage()
//     }
//   })

//   async function calculateAverage(){

 
//     const getAveragequery = ` SELECT starRating FROM ${reviewTable} WHERE productHandle='${handle}' AND reviewStatus='Published'`;
//     con.query(getAveragequery, async (err, results) => {
//       if (err) {
//         console.error('Error fetching average rating', err);
//         return;
//       }
//       else {
//         let sum = 0;
//         let rating = results.map((itm) => itm.starRating)
//         length = results.length
//         let totalRating = rating.forEach((itm) => {
//           sum += itm;
//         })
//         averageRating = sum / length;
//         console.log('average rating inside', averageRating?.toFixed(1))
//         console.log('review count inside ' , length)
//         await metafieldFunctionality()
  
//       }
//     });
//   }

//   async function metafieldFunctionality() {

//     const getRatingMetaIdQuery = `query {
//       product(id: "gid://shopify/Product/${Id}") {
//         metafield(namespace: "itgeeks_reviews", key: "average_rating") {
//           id
//         }
//       }
//     }`

//     const getCountMetaIdQuery = `query {
//       product(id: "gid://shopify/Product/${Id}") {
//         metafield(namespace: "itgeeks_reviews", key: "review_count") {
//           id
//         }
//       }
//     }`



//   // Execute the rating  mutation
//   try {
//     const response = await client.query({
//       data: {
//         query: getRatingMetaIdQuery,
//       },
//     });

//     const myData = await response.body;

//     RatingMetaId = (Object(myData).data.product.metafield.id);

//   } catch (error) {
//     console.error('erorrrrrr=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
//   }

//   // Execute the count  mutation
//   try {
//     const response = await client.query({
//       data: {
//         query: getCountMetaIdQuery,
//       },
//     });

//     const myData = await response.body;

//     ReviewCountId = (Object(myData).data.product.metafield.id);

//   } catch (error) {
//     console.error('erorrrrrr=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
//   }


//   //****************** updating my metafield *************************/

//   const metafieldsWithId = [
//     {
//       id: `${RatingMetaId}`,
//       value: `${averageRating?.toFixed(1)}`, // Default value for review count

//     },
//     {
//       id: `${ReviewCountId}`,
//       value: `${length}`, // Default value for review count

//     },
//   ];

//   console.log('average rating ', averageRating?.toFixed(1))
//   console.log('review count ' , length)

//   // Define the GraphQL mutation
//   const UpdateMetafieldMutation = `mutation productUpdate($input: ProductInput!) {
//         productUpdate(input: $input) {
//         product {
//         id
//         metafields(first: 10) {
//         edges {
//         node {
//         namespace
//         key
//         value
//         }
//         }
//         }
//         }
//         userErrors {
//         field
//         message
//         }
//         }
//         }`;

//   // Prepare the variables for the mutation
//   const Metafieldvariables = {
//     input: {
//       id: `gid://shopify/Product/${Id}`, // Replace with actual product ID
//       metafields: metafieldsWithId,
//     },
//   };

//   // Execute the mutation

//   try {
//     const mutationResponse = await client.query({
//       data: {
//         query: UpdateMetafieldMutation,
//         variables: Metafieldvariables,
//       },
//     });

//     console.log('update mutation userErrors ******************', Object(mutationResponse).body.data.productUpdate.userErrors)


//   } catch (error) {
//     console.error('erorrrrrr with update metafield =>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
//   }
// }
// };
export default { createReviewsTable, createDetailTable, createMetafield, updateMetafields, createSettingsTable }
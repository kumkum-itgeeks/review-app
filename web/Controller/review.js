// review controller

import shopify from '../shopify.js';
import { con } from '../index.js';




const totalReviews = (req, res) => {
  const status = req.params.status;
  const shopName = req.shopname
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'
  
  const query = `SELECT * FROM information_schema.tables WHERE table_schema = 'reviews' AND table_name = '${reviewTable}'`;

con.query(query, function (err, tables) {
  if (err) {
   return  res.status(400).send(JSON.stringify({'error' : err.message}))
  }

  if (tables.length > 0) {
  if (status == 'All') {
    con.query(`SELECT * FROM ${reviewTable}`, function (err, result) {
      if (err) {
        return  res.status(400).send(JSON.stringify({'error' : err.message}))
       }

      res.status(200).send(JSON.stringify(result.length))
    })
  }
  else if (status == 'Spam') {
    con.query(`SELECT * FROM ${reviewTable} WHERE isSpam = 1`, function (err, result) {
      if (err) {
        return  res.status(400).send(JSON.stringify({'error' : err.message}))
       }

      res.status(200).send(JSON.stringify(result.length))
    })
  }
  else {
    con.query(`SELECT * FROM ${reviewTable} WHERE reviewStatus='${status}'`, function (err, result) {
      if (err) {
        return  res.status(400).send(JSON.stringify({'error' : err.message}))
       }

      res.status(200).send(JSON.stringify(result.length))
    })
  }
}
else{
  res.status(200).send(JSON.stringify(0))

}

})
}


const getAllReviews = (req, res) => {

  const SearchValue = (req.body.queryValue).trim();
  const pageNumber = (req.body.pageNumber);
  const status = (req.body.reviewStatus);
  const sortSelected = (req.body.sortSelected);
  const limit = 3;
  const offset = (pageNumber - 1) * limit;
  const sortStr = sortSelected.toString();
  const shopName = req.shopname;
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'

  const query = `SELECT * FROM information_schema.tables WHERE table_schema = 'reviews' AND table_name = '${reviewTable}'`;

con.query(query, function (err, tables) {
  if (err) {
    return  res.status(400).send(JSON.stringify({'error' : err.message}))
   }

  if (tables.length > 0) {
      //check if search
  if (SearchValue.length <= 0) {
    //check if selected all reviews as filter
    if (status == 'All Reviews') {
      con.query(`SELECT * FROM ${reviewTable} ORDER BY ${sortStr} LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
        if (err) {
          return  res.status(400).send(JSON.stringify({'error' : err.message}))
         }
        res.send(JSON.stringify(result));
      })
    }
    else if (status == 'Spam') {

      con.query(`SELECT * FROM ${reviewTable}  WHERE isSPAM = 1 ORDER BY ${sortStr} LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
        if (err) {
          return  res.status(400).send(JSON.stringify({'error' : err.message}))
         }
        res.send(JSON.stringify(result));
      })

    }
    else {

      con.query(`SELECT * FROM ${reviewTable}  WHERE reviewStatus='${status}' ORDER BY ${sortStr} LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
        if (err) {
          return  res.status(400).send(JSON.stringify({'error' : err.message}))
         }
        res.send(JSON.stringify(result));
      })
    }
  }
  else {
    if (status == 'All Reviews') {

      con.query(`SELECT * FROM ${reviewTable} Where LOWER(reviewTitle) LIKE '%${SearchValue}%' ORDER BY ${sortStr}  LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
        if (err) {
          return  res.status(400).send(JSON.stringify({'error' : err.message}))
         }
        res.send(JSON.stringify(result));
      })

    }
    else {

      con.query(`SELECT * FROM ${reviewTable} Where LOWER(reviewTitle) LIKE '%${SearchValue}%' AND reviewStatus='${status}' ORDER BY ${sortStr}   LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
        if (err) {
          return  res.status(400).send(JSON.stringify({'error' : err.message}))
         }
        res.send(JSON.stringify(result));
      })
    }
  }
  } else {
    res.send(JSON.stringify([]));
  }
});

}


const getReviews = (req, res) => {
  const status = req.params.status;
  const shopName = req.shopname
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'

  con.query(`SELECT * FROM ${reviewTable} WHERE reviewStatus='${status}'`, function (err, result) {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    res.status(200).send(JSON.stringify(result))
  })
}

const deleteReview = (req, res) => {
  const id = req.params.id;
  const shopName = req.shopname
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'
  let deletdReviewTable = shopName + '_deleted_reviews'
  var productId = [];
  var producthandle = [];
  var totalData;


  const getHandleQuery = ` SELECT * FROM ${detailTable} WHERE id IN (${id})`
  const query = `DELETE FROM ${reviewTable} WHERE id IN (${id}) ; DELETE FROM ${detailTable} WHERE id IN (${id})`


  con.query(getHandleQuery, function async(err, result) {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    // res.send(JSON.stringify(result));
    else {
      totalData = result;
      result.map(async (obj) => {
        const { productid, productHandle } = obj;
        producthandle.push(productHandle);
        productId.push(productid);
      })
      saveDeletedReviews();
    }
  })

  async function saveDeletedReviews() {

    totalData?.map((obj, ind) => {

      let Columns = (Object.keys(obj))
      let Data = Object.values(obj)
      let DataValue = Data.map(cat => `'${cat}'`).join(', ');

      const query = `INSERT INTO ${deletdReviewTable} (${Columns}) VALUES (${DataValue});`
      con.query(query, async (err, results) => {
        if (err) {
          return  res.status(400).send(JSON.stringify({'error' : err.message}))
         }

        else {
          if (ind === (totalData.length) - 1) {
            await deleteReview()
          }
        }

      });
    })

  }




  async function deleteReview() {
    con.query(query, function (err, result) {
      if (err) {
        return  res.status(400).send(JSON.stringify({'error' : err.message}))
       }
      res.send(JSON.stringify({ productid: productId, productHandle: producthandle }));
    })
  }

}

const UnSpamReview = async(req, res) => {
  const id = req.params.id;
  const shopName = req.shopname;
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'
  let spamReviews;

  const query = `UPDATE ${reviewTable} SET isSpam = 0 WHERE id IN (${id}) ;UPDATE ${detailTable} SET isSpam = 0 WHERE id IN (${id}) `
  const checkspam = `SELECT isSpam FROM ${reviewTable} WHERE id IN (${id}) AND isSpam = 1`
  con.query(checkspam, async function (err, result) {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     } 
    else{
      spamReviews = result.length;
      await updateUnspam()
    }
  })


  async function updateUnspam(){

    con.query(query, function (err, result) {
      if (err) {
        return  res.status(400).send(JSON.stringify({'error' : err.message}))
       }
      res.send(JSON.stringify({count : spamReviews}));
    })
  }
}

const publishReview = async(req, res) => {
  const id = req.params.id;
  let shopName = req.shopname;
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'
  var unPublished;

  const checkPublish = `SELECT id FROM ${reviewTable} WHERE id IN (${id}) AND reviewStatus = 'Unpublished'`;
  con.query(checkPublish, async function (err, result) {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    else{
      unPublished = result.length;
      await publish()
    }

  })

  const query = `UPDATE ${reviewTable} SET reviewStatus = 'Published' WHERE id IN (${id});UPDATE ${detailTable} SET reviewStatus = 'Published' WHERE id IN (${id}) `
  async function publish(){
    con.query(query, function (err, result) {
      if (err) {
        return  res.status(400).send(JSON.stringify({'error' : err.message}))
       }
      res.send(JSON.stringify({count : unPublished}));
    })
  }
}

const unpublishReview = (req, res) => {
  const id = req.params.id;
  let shopName = req.shopname;
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'
  var published;

  const checkUnpublish = `SELECT id FROM ${reviewTable} WHERE id IN (${id}) AND reviewStatus = 'Published'`;
  con.query(checkUnpublish, async function (err, result) {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    else{
      published = result.length;
      await unPublish()
    }

  })

  const query = `UPDATE ${reviewTable} SET reviewStatus = 'Unpublished' WHERE id IN (${id});UPDATE ${detailTable} SET reviewStatus = 'Unpublished' WHERE id IN (${id}) `
  async function unPublish(){
    con.query(query, function (err, result) {
      if (err) {
        return  res.status(400).send(JSON.stringify({'error' : err.message}))
       }
      res.send(JSON.stringify({count : published}));
    })
  }
}

const getProductReviews = (req, res) => {
  const id = req.params.id;
  let shopName = req.shopname;
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'

  const query = `SELECT * FROM ${detailTable} WHERE productid=${id}`
  con.query(query, function (err, result) {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    res.send(JSON.stringify(result));
  })

}

const getAllProductReviews = (req, res) => {

  var query;
  var averageRating;
  var length;
  var isLastPage;
  var publishedReviews;
  var unpublishedReviews;
  const SearchValue = (req.body.queryValue).trim();
  const id = req.body.Id;
  const pageNumber = (req.body.pageNumber);
  const status = (req.body.reviewStatus);
  const sortSelected = (req.body.sortSelected);
  const limit = 3;
  const offset = (pageNumber - 1) * limit;
  const sortStr = sortSelected.toString();
  let shopName = req.shopname;
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'


  //check if search
  if (SearchValue.length <= 0) {
    //check if selected all reviews as filter
    if (status == 'All Reviews') {

      query = `SELECT * FROM ${reviewTable} WHERE productid = ${id} ORDER BY ${sortStr} LIMIT ${limit} OFFSET ${offset}`

    }
    else if (status == 'Spam') {

      query = `SELECT * FROM ${reviewTable}  WHERE isSPAM = 1 AND productid = ${id} ORDER BY ${sortStr} LIMIT ${limit} OFFSET ${offset}`

    }
    else {

      query = `SELECT * FROM ${reviewTable}  WHERE reviewStatus='${status}' AND productid = ${id} ORDER BY ${sortStr} LIMIT ${limit} OFFSET ${offset}`

    }
  }
  else {
    if (status == 'All Reviews') {

      query = `SELECT * FROM ${reviewTable} Where LOWER(reviewTitle) LIKE '%${SearchValue}%' AND productid = ${id} ORDER BY ${sortStr}  LIMIT ${limit} OFFSET ${offset}`

    }
    else {
      query = `SELECT * FROM ${reviewTable} Where LOWER(reviewTitle) LIKE '%${SearchValue}%' AND  reviewStatus='${status}' AND productid = ${id} ORDER BY ${sortStr}  LIMIT ${limit} OFFSET ${offset}`

    }
  }

  // querying the selected query for results

  let publishedQuery = ` SELECT * FROM ${reviewTable} WHERE reviewStatus='Published' AND productid = ${id}`
  let totalData = ` SELECT * FROM ${reviewTable} WHERE productid = ${id}`

  con.query(publishedQuery, function (err, result) {

    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    publishedReviews = result.length;
  })

  con.query(totalData, function (err, result) {

    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    let sum = 0;
    length = result.length;
    unpublishedReviews = length - publishedReviews
    let rating = result.map((itm) => itm.starRating)

    rating.map((itm) => {
      sum += itm;
    })
    averageRating = sum / length;
    if (length < (limit + offset)) {
      isLastPage = true
    }
    else {
      isLastPage = false
    }
  })

  con.query(query, function (err, result) {

    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }

    res.send(JSON.stringify({
      reviews: result,
      isLastPage: isLastPage,
      publishedReviews: publishedReviews,
      unpublishedReviews: unpublishedReviews,
      averageRating: averageRating
    }));
  })

}

const getReviewsForExport = (req, res) => {

  const reviewTable = req.shopname + '_details';

  const query = `SELECT productHandle , reviewStatus , starRating , reviewTitle , userName , Email , location , reviewDescription , reply , datePosted  FROM ${reviewTable}`;
  con.query(query, function (err, result) {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    res.send(JSON.stringify(result));
  })

}
const getDeletedReviewsForExport = (req, res) => {

  const deletedReviewTable = req.shopname + '_deleted_reviews';

  const query = `SELECT productHandle , reviewStatus , starRating , reviewTitle , userName , Email , location , reviewDescription , reply , datePosted  FROM ${deletedReviewTable}`;
  con.query(query, function (err, result) {
    if (err) {
      return  res.status(400).send(JSON.stringify({'error' : err.message}))
     }
    else{
      res.send(JSON.stringify(result));
    }
  })

}

const checkProduct = async (req, res) => {

  const detailsTable = req.shopname + '_details';
  const handleArr = (req.params.handle).split(',');
  const session = res.locals.shopify.session;
  var client = new shopify.api.clients.Graphql({ session });

  const promises = handleArr.map((handle) => client.query({
    data: {
      "query": `query getProductIdFromHandle($handle: String!) {
              productByHandle(handle: $handle) {
                id
              }
            }`,
      "variables": {
        "handle": `${handle}`
      },
    },
  })
  )

  const data = await Promise.all(promises);

  let IdArr = data.map((itm) => Object(itm)?.body?.data?.productByHandle?.id)

  var ResponseArr = [];

  IdArr?.map((Id, ind) => {

    if (Id === undefined || Id === null || Id === '' || !Id) {
      // logger.error(`Error importing review at Line : ${ind}`);

      ResponseArr.push({ idExists: false, pid: null })
    }
    else {
      ResponseArr.push({ idExists: true, pid: Id })
    }
  })

  res.status(200).send(JSON.stringify(ResponseArr))

}

const addImportedReview = async (req, res) => {

  const shop = req.shopname;
  const ObjArray = (req.body.review);
  const handle = (req.body.handle);
  const Id = (req.body.pidArr);
  const reviewTable = shop + '_review'
  const detailsTable = shop + '_details'
  const settingsTable = shop + '_settings'
  var averageRating = [];
  var length = [];
  var Columns;
  var Data;
  var DataValue;

  const session = res.locals.shopify.session;
  var client = new shopify.api.clients.Graphql({ session });


  ObjArray.map((obj, ind) => {

    Columns = (Object.keys(obj))
    Data = Object.values(obj)
    DataValue = Data.map(cat => `'${cat}'`).join(', ');

    const query = `INSERT INTO ${reviewTable} (${Columns} , productid) VALUES (${DataValue} , '${Id[ind]}');INSERT INTO ${detailsTable} (${Columns} , productid) VALUES (${DataValue} , '${Id[ind]}')`
    
    con.query(query, async (err, results) => {
      if (err) {
        return  res.status(400).send(JSON.stringify({'error' : err.message}))
       }

      else {
        if (ind === (ObjArray.length) - 1) {
          await removeDuplicateHandles()
        }
      }

    });
  });

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
          return  res.status(400).send(JSON.stringify({'error' : err.message}))
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
        return  res.status(400).send(JSON.stringify({'error' : error.message}))
       
    }

    //********* retrieveing count meta id  *****************/
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
      
        return  res.status(400).send(JSON.stringify({'error' : error.message}))
       
    }


    //****************** creating metafield *************************/

    // Construct the GraphQL mutation string
    const createMetafieldMutation = `
mutation {
  ${filteredIds.map((id, index) => `
    productUpdate${index}: productUpdate(
      input: {
        id: "gid://shopify/Product/${id}",
        metafields: [
          {
            namespace: "itgeeks_reviews",
            key: "average_rating",
            value: "${Number(averageRating[index]).toFixed(1)}",
            type: "number_decimal"
          },
          {
            namespace: "itgeeks_reviews",
            key: "review_count",
            value: "${length[index]}",
            type: "integer"
          }
        ]
      }
    ) {
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
  `).join('\n')}
}
`;

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

      RatingMetaId.map(async (id, ind) => {

        // ************ checking if metafield exists or not //
        if (id === null || id === '' || id === undefined) {

          try {
            const createResponse = await client.query({
              data: {
                query: `
                mutation {
               
                    productUpdate: productUpdate(
                      input: {
                        id: "gid://shopify/Product/${filteredIds[ind]}",
                        metafields: [
                          {
                            namespace: "itgeeks_reviews",
                            key: "average_rating",
                            value: "${Number(averageRating[ind]).toFixed(1)}",
                            type: "number_decimal"
                          },
                          {
                            namespace: "itgeeks_reviews",
                            key: "review_count",
                            value: "${length[ind]}",
                            type: "integer"
                          }
                        ]
                      }
                    ) {
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
              }
            });

            console.log('create mutation user Errors ===>', Object(createResponse).body.data.productUpdate.userErrors)

          } catch (error) {
          
              return  res.status(400).send(JSON.stringify({'error' : error.message}))
             
          }
        }

        else {
          // Execute the update  mutation
          try {
            const mutationResponses = await Promise.all(filteredIds.map(async (data) => {
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
            await res.status(200).send(JSON.stringify({ message: 'Review imported succesfully' }))

          } catch (error) {
              return  res.status(400).send(JSON.stringify({'error' : error.message}))
          }
        }
      })
    }
  }
}


export default { getAllReviews, getProductReviews, totalReviews, getReviews, deleteReview, getDeletedReviewsForExport, UnSpamReview, publishReview, unpublishReview, getAllProductReviews, getReviewsForExport, checkProduct, addImportedReview } 
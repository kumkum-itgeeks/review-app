// review controller

import shopify from '../shopify.js';
// import sql from 'mysql';

// import api from '../shop.js';
// const {detailTable,reviewTable}=api
import { con } from '../index.js';


const totalReviews = (req, res) => {
  const status = req.params.status;
  const shop = res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replace("-", "_");
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'
  if (status == 'All') {
    con.query(`SELECT * FROM ${reviewTable}`, function (err, result) {
      if (err) throw err;

      res.status(200).send(JSON.stringify(result.length))
    })
  }
  else if (status == 'Spam') {
    con.query(`SELECT * FROM ${reviewTable} WHERE isSpam = 1`, function (err, result) {
      if (err) throw err;

      res.status(200).send(JSON.stringify(result.length))
    })
  }
  else {
    con.query(`SELECT * FROM ${reviewTable} WHERE reviewStatus='${status}'`, function (err, result) {
      if (err) throw err;

      res.status(200).send(JSON.stringify(result.length))
    })
  }
}


const getAllReviews = (req, res) => {

  const SearchValue = (req.body.queryValue).trim();
  const pageNumber = (req.body.pageNumber);
  const status = (req.body.reviewStatus);
  const sortSelected = (req.body.sortSelected);
  const limit = 3;
  const offset = (pageNumber - 1) * limit;
  const sortStr = sortSelected.toString();
  const shop = res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replace("-", "_");
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'

  //check if search
  if (SearchValue.length <= 0) {
    //check if selected all reviews as filter
    if (status == 'All Reviews') {
      con.query(`SELECT * FROM ${reviewTable} ORDER BY ${sortStr} LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
      })
    }
    else if (status == 'Spam') {

      con.query(`SELECT * FROM ${reviewTable}  WHERE isSPAM = 1 ORDER BY ${sortStr} LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
      })

    }
    else {

      con.query(`SELECT * FROM ${reviewTable}  WHERE reviewStatus='${status}' ORDER BY ${sortStr} LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
      })
    }
  }
  else {
    if (status == 'All Reviews') {

      con.query(`SELECT * FROM ${reviewTable} Where LOWER(reviewTitle) LIKE '%${SearchValue}%' ORDER BY ${sortStr}  LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
      })

    }
    else {

      con.query(`SELECT * FROM ${reviewTable} Where LOWER(reviewTitle) LIKE '%${SearchValue}%' AND reviewStatus='${status}' ORDER BY ${sortStr}   LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
      })
    }
  }
}


const getReviews = (req, res) => {
  const status = req.params.status;
  const shop = res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replace("-", "_");
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'

  con.query(`SELECT * FROM ${reviewTable} WHERE reviewStatus='${status}'`, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.status(200).send(JSON.stringify(result))
  })
}

const deleteReview = (req, res) => {
  const id = req.params.id;
  const shop = res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replace("-", "_");
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'


  const query = `DELETE FROM ${reviewTable} WHERE id IN (${id}) ; DELETE FROM ${detailTable} WHERE id IN (${id})`
  con.query(query, function (err, result) {
    if (err) throw err;
    res.send(JSON.stringify(result));
  })

}

const UnSpamReview = (req, res) => {
  const id = req.params.id;
  const shop = res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replace("-", "_");
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'


  const query = `UPDATE ${reviewTable} SET isSpam = 0 WHERE id IN (${id}) ;UPDATE ${detailTable} SET isSpam = 0 WHERE id IN (${id}) `
  con.query(query, function (err, result) {
    if (err) throw err;
    res.send(JSON.stringify(result));
  })
}

const publishReview = (req, res) => {
  const id = req.params.id;
  const shop = res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replace("-", "_");
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'


  const query = `UPDATE ${reviewTable} SET reviewStatus = 'Published' WHERE id IN (${id});UPDATE ${detailTable} SET reviewStatus = 'Published' WHERE id IN (${id}) `
  con.query(query, function (err, result) {
    if (err) throw err;
    res.send(JSON.stringify(result));
  })
}

const unpublishReview = (req, res) => {
  const id = req.params.id;
  const shop = res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replace("-", "_");
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'

  const query = `UPDATE ${reviewTable} SET reviewStatus = 'Unpublished' WHERE id IN (${id});UPDATE ${detailTable} SET reviewStatus = 'Unpublished' WHERE id IN (${id}) `
  con.query(query, function (err, result) {
    if (err) throw err;
    res.send(JSON.stringify(result));
  })
}

const getProductReviews = (req, res) => {
  const id = req.params.id;
  const shop = res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replace("-", "_");
  let reviewTable = shopName + '_review'
  let detailTable = shopName + '_details'

  const query = `SELECT * FROM ${detailTable} WHERE productid=${id}`
  con.query(query, function (err, result) {
    if (err) throw err;
    res.send(JSON.stringify(result));
  })
  // res.send(JSON.stringify('product review'))
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
  const shop = res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replace("-", "_");
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

    if (err) throw err;
    publishedReviews = result.length;
    console.log('published reviews', publishedReviews)
  })

  con.query(totalData, function (err, result) {

    if (err) throw err;
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
    console.log('avg rating ', isLastPage)
  })

  con.query(query, function (err, result) {

    if (err) throw err;

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
      console.error('error fetching reviews', err)
    }
    res.send(JSON.stringify(result));
  })

}

const checkProduct = async (req, res) => {

  const detailsTable = req.shopname + '_details';
  const handleArr = (req.params.handle).split(',');
  const session = res.locals.shopify.session;
  var client = new shopify.api.clients.Graphql({ session });
  // console.log("handleArr==>", handleArr)
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
  // const dataArr = data.map((itm)=>itm)
  let IdArr = data.map((itm) => Object(itm)?.body?.data?.productByHandle?.id)

  var ResponseArr = [];

  IdArr?.map((Id) => {

    // let myId= Object(data).body.data.productByHandle.id;
    if (Id === undefined || Id === null || Id === '' || !Id) {
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
  // const ObjArray = JSON.parse(req.params.obj);
  // const handle = JSON.parse(req.params.handle);
  // const Id = JSON.parse(req.params.id);
  const ObjArray = (req.body.review);
  const handle = (req.body.handle);
  const Id = (req.body.pidArr);
  // console.log('ID===>', (Obj))
  // return;
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
    // console.log('Data valuee===>', DataValue);
    const query = `INSERT INTO ${reviewTable} (${Columns} , productid) VALUES (${DataValue} , '${Id[ind]}');INSERT INTO ${detailsTable} (${Columns} , productid) VALUES (${DataValue} , '${Id[ind]}')`
    con.query(query, async (err, results) => {
      if (err) {
        console.error('Error inserting reviews', err);
        return;
      }
      // res.send(JSON.stringify('Data inserted successfully'));
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
  // console.log(removeDuplicates(arr));



  async function avgRating(filteredHandles) {

    //************** fetching average rating from db to store in metafield */
    // console.log(filteredHandles, 'handles**************')
    filteredHandles.map((itm, ind) => {
      // console.log(itm,"itm *********")
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
          // console.log("averageRating====>>>>", averageRating)
          if (ind === (filteredHandles.length) - 1) {
            await removeDuplicateIds()
          }
          // await metafieldFunctionality()

        }
      });
    })
  }

  async function removeDuplicateIds() {
    let filteredIds = Id.filter((item,
      index) => Id.indexOf(item) === index);
    await metafieldFunctionality(filteredIds)
  }
  // return;
  async function metafieldFunctionality(filteredIds) {

    //           console.log("averageRating====>>>>", averageRating)
    // return;
    var RatingMetaId;
    var ReviewCountId;

    // return;
    // const getRatingMetaIdQuery = `query {
    //   product(id: "gid://shopify/Product/${Id}") {
    //     metafield(namespace: "itgeeks_reviews", key: "average_rating") {
    //       id
    //     }
    //   }
    // }`

    // const getCountMetaIdQuery = `query {
    //   product(id: "gid://shopify/Product/${Id}") {
    //     metafield(namespace: "itgeeks_reviews", key: "review_count") {
    //       id
    //     }
    //   }
    // }`

    // Execute the rating  mutation
    // try {
    //   Id.map(async(itm,ind)=>{
    //     const response = await client.query({
    //       data: {
    //         query: `query {
    //           product(id: "gid://shopify/Product/${itm}") {
    //             metafield(namespace: "itgeeks_reviews", key: "average_rating") {
    //               id
    //             }
    //           }
    //         }`,
    //       },
    //     });

    //     const myData = await response?.body;

    //     RatingMetaId = await (Object(myData)?.data?.product?.metafield?.id);

    //     console.log(RatingMetaId,"**************ratingn id meta")
    //   })

    // } catch (error) {
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

      // console.log(RatingMetaId, "**************ratingn id meta");
    } catch (error) {
      console.error('erorrrrrr=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
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

      // console.log(ReviewCountId, "**************count id meta");
    } catch (error) {
      console.error('erorrrrrr=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
    }

    // return;
    // Execute the count  mutation
    // try {
    //   const response = await client.query({
    //     data: {
    //       query: `query {
    //         product(id: "gid://shopify/Product/${Id}") {
    //           metafield(namespace: "itgeeks_reviews", key: "review_count") {
    //             id
    //           }
    //         }
    //       }`,
    //     },
    //   });

    //   const myData = await response.body;

    //   ReviewCountId = (Object(myData).data.product.metafield.id);

    // } catch (error) {
    //   console.error('erorrrrrr=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
    // }


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


    // const createMetafieldMutations = `
    // mutation {
    //   productUpdate(
    //     input : {
    //       id: "gid://shopify/Product/${Id}",
    //       metafields: [
    //         {
    //           namespace: "itgeeks_reviews",
    //           key: "average_rating",
    //           value: "${averageRating?.toFixed(1)}",
    //           type: "number_decimal",
    //         },
    //         {
    //           namespace: "itgeeks_reviews",
    //           key: "review_count",
    //           value: "${length}",
    //           type: "integer",
    //         }
    //       ]
    //     }) {
    //       product {
    //         metafields(first: 3) {
    //           edges {
    //             node {
    //               namespace
    //               key
    //               value
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    //   `

    //****************** updating my metafield *************************/

    // const metafieldsWithId = [
    //   {
    //     id: `${RatingMetaId}`,
    //     value: `${averageRating?.toFixed(1)}`, // Default value for review count

    //   },
    //   {
    //     id: `${ReviewCountId}`,
    //     value: `${length}`, // Default value for review count

    //   },
    // ];
    // const metafieldsWithId = [];

    // RatingMetaId.forEach(async (ratingId, index) => {
    //   const reviewId = ReviewCountId[index];
    //   const avgRating = averageRating[index].toFixed(1);
    //   const mylength = length[index];

    //   const metafield = {
    //     id: ratingId,
    //     value: avgRating,
    //   };

    //   metafieldsWithId.push(metafield);

    //   const countMetafield = {
    //     id: reviewId,
    //     value: mylength.toString(),
    //   };

    //   metafieldsWithId.push(countMetafield);
    // });

    // console.log(metafieldsWithId, 'metaidddd with data******************');


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
    // const Metafieldvariables = {
    //   input: {
    //     id: `gid://shopify/Product/${Id}`, // Replace with actual product ID
    //     metafields: metafieldsWithId,
    //   },
    // };

    // const metafieldsWithIds = [];
    // var productId=[];
    // var Metafieldvariables;

    // RatingMetaId.forEach(async(ratingId, index) => {
    //   const myreviewCountId = await ReviewCountId[index];
    //   const myaverageRating = await averageRating[index];
    //   const mylength = await length[index];
    //   productId.push(filteredIds[index]); // Product ID corresponding to the metafields

    //   metafieldsWithIds.push({
    //     id: ratingId,
    //     value: Number(myaverageRating).toFixed(1),

    //   });

    //   metafieldsWithIds.push({
    //     id: myreviewCountId,
    //     value: mylength.toString()
    //   });
    //   // console.log(metafieldsWithIds, "datas***********")
    //   await generateWholeVariable()
    // });

    // // Construct the mutation input object

    // async function generateWholeVariable(){
    //   Metafieldvariables = {
    //    input: {
    //      id: `gid://shopify/Product/${productId}`, // Use the correct product ID here
    //      metafields:(metafieldsWithIds)
    //    },
    //  };

    //  await PerformMetaFunctionality();
    // }


    PerformMetaFunctionality();
    async function PerformMetaFunctionality() {

      // console.log((Metafieldvariables), 'herererere')

      //   let resss= filteredIds.map(async(id, ind)=>{

      //      [   {
      //          id: `gid://shopify/Product/${id}`, // Use the correct product ID here
      //          metafields:[
      //            {
      //              id: RatingMetaId[ind],
      //              value: Number(averageRating[ind]).toFixed(1),

      //            },
      //            {
      //              id: ReviewCountId[ind],
      //              value: length[ind].toString()
      //            }
      //          ]
      //        }
      //       ]
      //  })
      //   console.log(resss)


      // return;

      // ************ checking if metafield exists or not //
      if (RatingMetaId === null || RatingMetaId === '' || RatingMetaId === undefined || ReviewCountId === null || ReviewCountId === '' || ReviewCountId === undefined) {

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
          const mutationResponses = await Promise.all(filteredIds.map(async (id, ind) => {
            console.log(id, 'piddd.......')
            const response = await client.query({
              data: {
                query: UpdateMetafieldMutation,
                variables: {
                  input: {
                    id: `gid://shopify/Product/${id}`, // Use the correct product ID here
                    metafields: [
                      {
                        id: `${(RatingMetaId[ind])}`,
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

          console.log('Mutation responses:', mutationResponses.map((Res) => Object(Res).body.data.productUpdate.userErrors));
        } catch (error) {
          console.error('Error updating metafields:', error.message);
        }

      }

    }

    // })

  }


}
// const addImportedReview=async(req,res)=>{

//   const Obj = JSON.parse(req.params.obj);
//   const shop = req.shopname;
//   const handle = req.params.handle;
//   const Id = req.params.id;
//   const reviewTable = shop + '_review'
//   const detailsTable = shop + '_details'
//   const settingsTable = shop + '_settings'
//   var averageRating;
//   var length;
//   const Columns = (Object.keys(Obj))
//   const Data = Object.values(Obj)
//   const DataValue = Data.map(cat => `'${cat}'`).join(', ');

//   const checkStatus = `Select settings FROM ${settingsTable} Where type='autopublish'`;
//   const query = `INSERT INTO ${reviewTable} (${Columns} , productid) VALUES (${DataValue} , '${Id}');INSERT INTO ${detailsTable} (${Columns} , productid) VALUES (${DataValue} , '${Id}')`
//   const enabledQuery = `INSERT INTO ${reviewTable} (${Columns} , reviewStatus) VALUES (${DataValue}, 'Published');INSERT INTO ${detailsTable} (${Columns} , reviewStatus) VALUES (${DataValue},'Published')`

//   // con.query(checkStatus, (err, results) => {
//   //   if (err) {
//   //     console.error('Error inserting reviews', err);
//   //     return;
//   //   }
//   //   let settingObj = (JSON.parse(results[0].settings));
//   //   var reviewStatus = (settingObj.autopublish)

//   //   if (reviewStatus === 'enabled') {
//   //     con.query(enabledQuery, async (err, results) => {
//   //       if (err) {
//   //         console.error('Error inserting reviews', err);
//   //         return;
//   //       }
//   //       // res.send(JSON.stringify('Data inserted successfully'));
//   //       await avgRating()

//   //     });
//   //   }
//   //   else {
//       con.query(query, async (err, results) => {
//         if (err) {
//           console.error('Error inserting reviews', err);
//           return;
//         }
//         // res.send(JSON.stringify('Data inserted successfully'));
//         await avgRating()

//       });
//   //   }
//   // });

//   async function avgRating() {

//     //************** fetching average rating from db to store in metafield */
//     const getAveragequery = ` SELECT starRating , reviewTitle FROM ${reviewTable} WHERE productHandle=${handle} AND reviewStatus='Published'`;
//     con.query(getAveragequery, async (err, results) => {
//       if (err) {
//         console.error('Error fetching reviews', err);
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
//         await metafieldFunctionality()

//       }
//     });
//   }

//   async function metafieldFunctionality() {

//     //****************** getting session data *******************/
//     let completeShop = shop + '.myshopify.com';
//     var session;
//     var RatingMetaId;
//     var ReviewCountId;

//     let getSessionQuery = `Select * from shopify_sessions WHERE shop='${completeShop}'`
//     con.query(getSessionQuery, async (err, results) => {
//       if (err) {
//         console.error('err fetching session ', err)

//       }


//       session = results[0];

//       let version = shopify.api.config.apiVersion
//       let endpoint = `https://${shop}.myshopify.com/admin/api/${version}/graphql.json`;

//       const client = new shopify.api.clients.Graphql({ session });


//       //****************************** retrieving metafield id ************************



//       const getRatingMetaIdQuery = `query {
//       product(id: "gid://shopify/Product/${Id}") {
//         metafield(namespace: "itgeeks_reviews", key: "average_rating") {
//           id
//         }
//       }
//     }`

//       const getCountMetaIdQuery = `query {
//       product(id: "gid://shopify/Product/${Id}") {
//         metafield(namespace: "itgeeks_reviews", key: "review_count") {
//           id
//         }
//       }
//     }`


//       // Execute the rating  mutation
//       try {
//         const response = await client.query({
//           data: {
//             query: getRatingMetaIdQuery,
//           },
//         });

//         const myData = await response.body;

//         RatingMetaId = (Object(myData).data.product.metafield.id);

//       } catch (error) {
//         console.error('erorrrrrr=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
//       }

//       // Execute the count  mutation
//       try {
//         const response = await client.query({
//           data: {
//             query: getCountMetaIdQuery,
//           },
//         });

//         const myData = await response.body;

//         ReviewCountId = (Object(myData).data.product.metafield.id);

//       } catch (error) {
//         console.error('erorrrrrr=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
//       }

//       //****************** creating metafield *************************/

//       const createMetafieldMutation = `
//       mutation {
//         productUpdate(
//           input : {
//             id: "gid://shopify/Product/${Id}",
//             metafields: [
//               {
//                 namespace: "itgeeks_reviews",
//                 key: "average_rating",
//                 value: "${averageRating?.toFixed(1)}",
//                 type: "number_decimal",
//               },
//               {
//                 namespace: "itgeeks_reviews",
//                 key: "review_count",
//                 value: "${length}",
//                 type: "integer",
//               }
//             ]
//           }) {
//             product {
//               metafields(first: 3) {
//                 edges {
//                   node {
//                     namespace
//                     key
//                     value
//                   }
//                 }
//               }
//             }
//           }
//         }
//         `

//         //****************** updating my metafield *************************/

//         const metafieldsWithId = [
//           {
//             id: `${RatingMetaId}`,
//             value: `${averageRating?.toFixed(1)}`, // Default value for review count

//           },
//           {
//             id: `${ReviewCountId}`,
//             value: `${length}`, // Default value for review count

//           },
//         ];

//         // Define the GraphQL mutation
//         const UpdateMetafieldMutation = `mutation productUpdate($input: ProductInput!) {
//     productUpdate(input: $input) {
//     product {
//     id
//     metafields(first: 10) {
//     edges {
//     node {
//     namespace
//     key
//     value
//     }
//     }
//     }
//     }
//     userErrors {
//     field
//     message
//     }
//     }
//     }`;

//       // Prepare the variables for the mutation
//       const Metafieldvariables = {
//         input: {
//           id: `gid://shopify/Product/${Id}`, // Replace with actual product ID
//           metafields: metafieldsWithId,
//         },
//       };


//       // ************ checking if metafield exists or not //
//       if (RatingMetaId === null || RatingMetaId === '' || RatingMetaId === undefined || ReviewCountId === null || ReviewCountId === '' || ReviewCountId === undefined ) {

//         console.log(' creating metafield **********************************************')
//         try {
//           const createResponse = await client.query({
//             data: {
//               query: createMetafieldMutation
//             }
//           });

//           console.log('create mutation response ******************', Object(createResponse).body.data.productUpdate.userErrors)

//         } catch (error) {
//           console.error('erorrrrrr with create metafield =>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
//         }
//       }

//       else {
//         // Execute the mutation

//         try {
//           const mutationResponse = await client.query({
//             data: {
//               query: UpdateMetafieldMutation,
//               variables: Metafieldvariables,
//             },
//           });

//           console.log('update mutation response ******************', Object(mutationResponse).body.data.productUpdate.userErrors)


//         } catch (error) {
//           console.error('erorrrrrr with update metafield =>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', error.message);
//         }

//       }

//     })

//   }


// }

export default { getAllReviews, getProductReviews, totalReviews, getReviews, deleteReview, UnSpamReview, publishReview, unpublishReview, getAllProductReviews, getReviewsForExport, checkProduct, addImportedReview } 
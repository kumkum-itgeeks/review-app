// details controller

// import shopify from '../shopify.js';
import shopify from '../shopify.js'
// import sql from 'mysql';

import { con } from '../index.js';



const getAllDetails = async (req, res) => {
  const id = req.params?.id;
  // const shop = res.locals.shopify.session.shop;
  // let shopLowercase = shop.toLowerCase();
  // let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  // let shopName = removeSuffix.replace("-", "_");
  let shopName = req.shopname;
  let detailsTable = shopName + '_details'

  const query = ` SELECT * FROM ${detailsTable} WHERE id=${id}`;
  con.query(query, function (err, result) {
    if (err) throw err;
    res.status(200).send(JSON.stringify(result))
  })
}

const changeStatus = async (req, res) => {

  const id = req.params.id;
  const status = req.params.status;
  let shopName = req.shopname;
  let detailTable = shopName + '_details'
  let reviewtable = shopName + '_review'
 
 
  if (status == 'Published') {
    const query = `UPDATE ${detailTable}  SET reviewStatus = 'Unpublished' WHERE id=${id};UPDATE ${reviewtable}  SET reviewStatus = 'Unpublished' WHERE id=${id}`
    con.query(query, function (err, result) {
      if (err) throw err;
      res.status(200).send(JSON.stringify(result))
    })
  }
  else {
    const query = `UPDATE ${detailTable}   SET reviewStatus = 'Published' WHERE id=${id};UPDATE ${reviewtable}   SET reviewStatus = 'Published' WHERE id=${id}`
    con.query(query, function (err, result) {
      if (err) throw err;
      res.status(200).send(JSON.stringify(result))
    })

  }
}

const postReply = async (req, res) => {

  const reply = req.body.textFieldValue;
  const id = req.body.Id;

  // const shop = res.locals.shopify.session.shop;
  // let shopLowercase = shop.toLowerCase();
  // let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  // let shopName = removeSuffix.replace("-", "_");
  let shopName= req.shopname;

  let detailTable = shopName + '_details'

  const query = `UPDATE ${detailTable} SET reply = '${reply}' WHERE id = ${id}`
  con.query(query, function (err, result) {
    if (err) throw err;
    res.send(JSON.stringify(result))

  })
  // res.send(JSON.stringify(reply))

}


const getShopifyProductDetails = async (req, res) => {
  const id = req.params?.id;

  const session = res.locals.shopify.session;

  const client = new shopify.api.clients.Graphql({ session });
  //   const queryString= `{
  //         product(id: "gid://shopify/Product/7214305771659") {
  //           title
  //           description
  //           onlineStoreUrl
  //         } 
  //   }`
  const queryString = `{
    product(id: "gid://shopify/Product/${id}") {
        title
        media(first: 5) {
          edges {
            node {
              ...fieldsForMediaTypes
            }
          }
        }
      }
    }
    
    fragment fieldsForMediaTypes on Media {
      alt
      mediaContentType
      preview {
        image {
          id
          altText
          originalSrc
        }
      }
    
        
  }`
  const response = await client.query({ data: queryString });
  res.status(200).send(JSON.stringify(response.body.data.product));
}

const getProductReviewDetails = (req, res) => {
  const id = req.params?.id;
  // const shop = res.locals.shopify.session.shop;
  //   let shopLowercase = shop.toLowerCase();
  //   let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  //   let shopName = removeSuffix.replace("-", "_");
  let shopName = req.shopname;

  let detailTable = shopName + '_details'

  const query = `SELECT * FROM ${detailTable} WHERE productid = ${id}`
  con.query(query, function (err, result) {
    if (err) throw err;
    res.status(200).send(JSON.stringify(result))

  })

}

const dissmissInappropriate = (req, res) => {

  const shop = req.shopname;
  const detailsTable = shop + '_details'
  const reviewTable = shop + '_review'
  const id = req.params.id

  const query = `UPDATE ${reviewTable} SET isInappropriate = '0' WHERE id=${id} ;UPDATE ${detailsTable} SET isInappropriate = '0' WHERE id=${id};`
  con.query(query, function (err, result) {
    if (err) throw err;
    res.send(JSON.stringify(result))

  })
}

export default { getAllDetails, changeStatus, postReply, getShopifyProductDetails, getProductReviewDetails, dissmissInappropriate }
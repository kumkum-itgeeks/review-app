import shopify from "../shopify.js";
import { con } from "../index.js";

const createReviewsTable = async (_req, res) => {

  const shop = await res.locals.shopify.session.shop;
  let shopLowercase = shop.toLowerCase();
  let removeSuffix = shopLowercase.replace(".myshopify.com", "");
  let shopName = removeSuffix.replace("-", "_");
  let tableName = shopName + '_reviews'

  var sql = `CREATE TABLE IF NOT EXISTS ${tableName}  (
      id INT NOT NULL AUTO_INCREMENT,
      reviewTitle VARCHAR(200),
      reviewDescription LONGTEXT,
      userName VARCHAR(255),
      productid INT(100),
      productHandle VARCHAR(255),
      datePosted DATE DEFAULT NOW(),
      reviewStatus VARCHAR(255),
      starRating INT(5),
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
      productid INT(100),
      productHandle VARCHAR(255),
      datePosted DATE DEFAULT NOW(),
      reviewStatus VARCHAR(255),
      starRating INT(5),
      reply LONGTEXT,
      PRIMARY KEY (id)
      )`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send(JSON.stringify('detail table created'));
  });

}


// const createMetafield = async (req, res) => {
//   const session = res.locals.shopify.session;
//   const client = new shopify.api.clients.Graphql({ session });

//   const definition = {
//     name: "Ingredients",
//     namespace: "bakery",
//     key: "ingredients",
//     description: "A list of ingredients used to make the product.",
//     type: "multi_line_text_field",
//     ownerType: "PRODUCT"
//   };

//   const queryString = `mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
//     metafieldDefinitionCreate(definition: $definition) {
//     createdDefinition {
//     id
//     name
//     }
//     userErrors {
//     field
//     message
//     code
//     }
//     }
//     }`;

//   const response = await client.query({
//     data: {
//       query: queryString,
//       variables: { definition }
//     }
//   });

//   res.send(JSON.stringify(response));
// };

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

  const getMetafields = async (req, res) => {
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({ session });
    
    // Define the GraphQL query
    const query = `{
    product(id: "gid://shopify/Product/7214305837195") {
    metafields(first: 10) {
    edges {
    node {
    namespace
    key
    value
    type
    }
    }
    }
    }
    }`;
    
    // Execute the query
    try {
    const response = await client.query({
    data: { query }
    });
    res.send(JSON.stringify(response.body.data.product.metafields.edges));
    } catch (error) {
    res.status(500).send(error.message);
    }
    };
export default { createReviewsTable, createDetailTable, createMetafield , getMetafields }
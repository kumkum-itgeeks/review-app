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
            console.log(result);
            res.status(200).send(JSON.stringify(result.length))
        })
    }
    else if(status=='Spam'){
        con.query(`SELECT * FROM ${reviewTable} WHERE isSpam = 1`, function (err, result) {
            if (err) throw err;
            console.log(result);
            res.status(200).send(JSON.stringify(result.length))
        })
    }
    else {
        con.query(`SELECT * FROM ${reviewTable} WHERE reviewStatus='${status}'`, function (err, result) {
            if (err) throw err;
            console.log(result);
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

const deleteReview =(req, res) => {
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

const UnSpamReview =  (req, res) => {
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

const getAllProductReviews = (req,res) => {

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
           
                con.query(`SELECT * FROM ${reviewTable} WHERE productid = ${id} ORDER BY ${sortStr} LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
                    if (err) throw err;
                    res.send(JSON.stringify(result));
                })
           
        }
        else if (status == 'Spam') {

                con.query(`SELECT * FROM ${reviewTable}  WHERE isSPAM = 1 AND productid = ${id} ORDER BY ${sortStr} LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
                    if (err) throw err;
                    res.send(JSON.stringify(result));
                })
        
        }
        else {

                con.query(`SELECT * FROM ${reviewTable}  WHERE reviewStatus='${status}' AND productid = ${id} ORDER BY ${sortStr} LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
                    if (err) throw err;
                    res.send(JSON.stringify(result));
                })
        }
    }
    else {
        if (status == 'All Reviews') {

                con.query(`SELECT * FROM ${reviewTable} Where LOWER(reviewTitle) LIKE '%${SearchValue}%' AND productid = ${id} ORDER BY ${sortStr}  LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
                    if (err) throw err;
                    res.send(JSON.stringify(result));
                })
      
        }
        else {
                con.query(`SELECT * FROM ${reviewTable} Where LOWER(reviewTitle) LIKE '%${SearchValue}%' AND  reviewStatus='${status}' AND productid = ${id} ORDER BY ${sortStr}  LIMIT ${limit} OFFSET ${offset}`, function (err, result) {
                    if (err) throw err;
                    res.send(JSON.stringify(result));
                })
       
        }
    }
}


export default { getAllReviews, getProductReviews, totalReviews, getReviews, deleteReview, UnSpamReview, publishReview, unpublishReview ,getAllProductReviews}
import express from "express";
import detailsController from "../Controller/details.js";

const router=express.Router();

router.get('/getAllDetails/:id',detailsController.getAllDetails);

router.get('/changeStatus/:id/:status',detailsController.changeStatus);

router.post('/postReply/',detailsController.postReply);

router.get('/getProductDetails/:id',detailsController.getShopifyProductDetails);

router.get('/getProductReviewDetails/:id',detailsController.getProductReviewDetails);

export default router;
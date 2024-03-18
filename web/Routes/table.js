import express from "express";
import TableController from '../Controller/table.js';

const router=express.Router();

router.get('/createReviewTable', TableController.createReviewsTable);

router.get('/createDetailTable', TableController.createDetailTable);

router.get('/createMetaField', TableController.createMetafield);

router.get('/getMetafields', TableController.getMetafields);

export default router;


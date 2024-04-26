import express from "express";
import TableController from '../Controller/table.js';

const router=express.Router();

router.get('/createReviewTable', TableController.createReviewsTable);

router.get('/createDetailTable', TableController.createDetailTable);

router.get('/createMetaField/:id/:rating', TableController.createMetafield);

router.get('/updateMetafields/:id/:pid/:handle', TableController.updateMetafields);

router.get('/createSettingsTable', TableController.createSettingsTable);

router.get('/createDeletedReviewsTable', TableController.createDeletedReviewsTable);

router.get('/checkTableExists', TableController.checkTableExists);

router.get('/checkPlanTableExists', TableController.checkPlanTableExists);

export default router;


import express from "express";
import reviewController from '../Controller/review.js'

const router=express.Router();

router.post('/getAllReviews/', reviewController.getAllReviews)

router.post('/getProductReviews/', reviewController.getAllProductReviews)

router.get('/totalReviews/:status/', reviewController.totalReviews)

router.get('/getReviews/:status/', reviewController.getReviews)

router.get('/deleteReview/:id', reviewController.deleteReview)

router.get('/Unspam/:id', reviewController.UnSpamReview)

router.get('/PublishReview/:id', reviewController.publishReview)

router.get('/unpublishReview/:id', reviewController.unpublishReview)

router.get('/exportReviews/', reviewController.getReviewsForExport)

router.get('/checkProduct/:handle', reviewController.checkProduct)

router.get('/addImportedReview/:obj/:handle/:id', reviewController.addImportedReview)


// router.get('/productReviews/:id', reviewController.getProductReviews)




export default router;

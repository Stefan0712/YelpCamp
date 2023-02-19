const express = require('express');

//the arguemeit is used if the param is set in the prefix set in the app.js
//instead of the router.get. Otherwise the param will be empty
const router = express.Router({mergeParams: true});

//utils for error handling
const catchAsync = require('../utils/catchAsync')

//import the middleware from the middlewares file
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')


//models
const Review = require('../models/review')
const Campground = require('../models/campground')

const reviews = require('../controllers/reviews')



//path for creating a new review
router.post('/',isLoggedIn,validateReview, catchAsync(reviews.createReview))
//path for deleting a review
router.delete('/:reviewId',isLoggedIn,isReviewAuthor ,catchAsync(reviews.deleteReview))





//export the router so you can use in the app.js
module.exports = router;
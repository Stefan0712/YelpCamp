const express = require('express');

//the arguemeit is used if the param is set in the prefix set in the app.js
//instead of the router.get. Otherwise the param will be empty
const router = express.Router({mergeParams: true});

//utils for error handling
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')


//JOI schema for errors
const {reviewSchema} = require('../schemas.js')

//models
const Review = require('../models/review')
const Campground = require('../models/campground')



//middleware that validate the input
const validateReview = (req, res, next)=>{
    //destruct the err from req.body
    const {error} = reviewSchema.validate(req.body);
    //if there is any error, then throw a new error with the err msg
    if(error){
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    }else{
        //if there is no error, then call next and show nothing
       next();
    }
}


//path for creating a new review
router.post('/', validateReview, catchAsync(async (req, res)=>{
    //finds the campground in the database
    const campground = await Campground.findById(req.params.id);
    //creates a new review using the review model and the info from the body of the form
    const review = new Review(req.body.review)
    //push the new review to the campground
    campground.reviews.push(review)
    //saves both the review and the campground
    await review.save()
    await campground.save()
    //flash msg
    req.flash('success','Successfully created a new review!')
    //redirects to the campground
    res.redirect(`/campgrounds/${campground._id}`)
}))
//path for deleting a review
router.delete('/:reviewId', catchAsync(async (req, res)=>{
    //destruct de id of the camp and the id of the review from the body
    const {id, reviewId} = req.params
    //searches and find the camp and remove the review id from it
    //and then finds  the review in the database and delete it 
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId)
    //flash msg
    req.flash('success','Successfully deleted the review!')
    //redirects to the campground
    res.redirect(`/campgrounds/${id}`)
    
}))





//export the router so you can use in the app.js
module.exports = router;
const Campground = require('../models/campground')
const Review = require('../models/review')


module.exports.createReview = async (req, res)=>{
    //finds the campground in the database
    const campground = await Campground.findById(req.params.id);
    //creates a new review using the review model and the info from the body of the form
    const review = new Review(req.body.review)
    //set the author to the current user id
    review.author = req.user._id;
    //push the new review to the campground
    campground.reviews.push(review)
    //saves both the review and the campground
    await review.save()
    await campground.save()
    //flash msg
    req.flash('success','Successfully created a new review!')
    //redirects to the campground
    res.redirect(`/campgrounds/${campground._id}`)
}
module.exports.deleteReview = async (req, res)=>{
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
    
}
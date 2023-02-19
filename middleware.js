//JOI schema for errors
const {campgroundSchema, reviewSchema} = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')
module.exports.isLoggedIn = (req, res, next)=>{

    //checks if the user is authenticated
    if(!req.isAuthenticated()){
        //saves the url before login screen to it can redirect the user
        //to where he originaly tried to go
        req.session.returnTo = req.originalUrl
        req.flash('error','You must be signed in!');
        return res.redirect('/login');
    }
    next();
}


 module.exports.isAuthor = async (req, res, next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id)
  //checks if you have the right to see the edit form
  if(!campground.author.equals(req.user._id)){
    req.flash('error','You do not have permission to do that')
    return res.redirect(`/campgrounds/${id}`)
}
next();
}
module.exports.validateCampground = (req, res, next)=>{
    
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    }else{
       next();
    }
}

module.exports.validateReview = (req, res, next)=>{
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


module.exports.isReviewAuthor = async (req, res, next)=>{
    const {reviewId, id} = req.params;
    const review = await Review.findById(reviewId)
  //checks if you have the right to see the edit form
  if(!review.author.equals(req.user._id)){
    req.flash('error','You do not have permission to do that')
    return res.redirect(`/campgrounds/${id}`)
}
next();
}
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const {campgroundSchema} = require('../schemas.js')




const validateCampground = (req, res, next)=>{
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    }else{
       next();
    }
}


//route for showing all campgrounds
router.get('/', catchAsync(async (req, res)=>{
    //finds all campgrounds in the database
    const campgrounds = await Campground.find({})
    //renders all the campgrounds using the view from the specified path
    res.render('campgrounds/index', {campgrounds})
}))
//route for creating a new campground
router.get('/new', (req, res)=>{
    //renders a form from which you can create  a new campground
    res.render('campgrounds/new')
})
//post route used by the create campground form that will use 
//validateCampground middleware (created in the beginning) and cathAsync
//for handling error
router.post('/', validateCampground, catchAsync(async (req, res, next)=>{
    
        //creates a new campground using campground model and data from req.body
        const campground = new Campground(req.body)
        //saves the campground to the database
        await campground.save();
        req.flash('success', 'Successfully made a new campground')
        //redirect to the newly created campground
        res.redirect(`/campgrounds/${campground._id}`);
    
}))
//route for showing a specific campground
router.get('/:id', catchAsync(async (req, res)=>{
    //destruct the id from req.params
    const {id} = req.params
    //find the campground in the database and then populate it with reviews
    //populate() is adding the reviews content to the campground
    const campground = await Campground.findById(id).populate('reviews')
    //flash error if campground is not found
    if(!campground){
        req.flash('error','Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    //renders the specific campground page using the specified view
    res.render('campgrounds/show', {campground})
}))
//route used to edit a specific campground
router.get('/:id/edit', catchAsync(async (req, res)=>{
    //destruct the id from req.params
    const {id} = req.params
    //finds the campground in the database
    const campground = await Campground.findById(id)
    //renders the form to edit the campground, populating it with existing
    //flash error if campground is not found
    if(!campground){
        req.flash('error','Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    //campground data
    res.render('campgrounds/edit', {campground})
}))
//route used by the edit form to update the campground
//it uses middlewares to validate the input
router.put('/:id', validateCampground, catchAsync(async (req, res)=>{
    //destruct the id from req.params
    const {id} = req.params;
    //finds the campground in the database and then updates it with the req.body info
    const campground = await Campground.findByIdAndUpdate(id, {...req.body})
    //set the flash msg and then showing it
    req.flash('success','Successfully updated the campground!')
    //redirects to that specific campground
    res.redirect(`/campgrounds/${campground._id}`)
}))
//route used by the delete form
router.delete('/:id', catchAsync(async (req, res)=>{
    //destruct the id from req.params
    const {id} = req.params;
    //finds the campground and then deletes it
    await Campground.findByIdAndDelete(id)
    //delete flash msg
    req.flash('success','Successfully deleted the campground!')
    //redirect to all campgrounds
    res.redirect('/campgrounds')
}))




module.exports = router;
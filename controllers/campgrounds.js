const Campground = require('../models/campground')
const { cloudinary } = require("../cloudinary/index")

module.exports.index = async (req, res)=>{
    //finds all campgrounds in the database
    const campgrounds = await Campground.find({})
    //renders all the campgrounds using the view from the specified path
    res.render('campgrounds/index', {campgrounds})
}
module.exports.renderNewForm = (req, res)=>{
    //renders a form from which you can create  a new campground
    res.render('campgrounds/new')
}
module.exports.createCampground = async (req, res, next)=>{
    
    //creates a new campground using campground model and data from req.body
    const campground = new Campground(req.body)
    //map over the uploaded images and then add the paths and filenames to the campground
    campground.images = req.files.map((f => ({url: f.path, filename: f.filename})))
    //set the author of the campground to the currently logged in user
    campground.author = req.user._id;
    //saves the campground to the database
    await campground.save();
    req.flash('success', 'Successfully made a new campground')
    //redirect to the newly created campground
    res.redirect(`/campgrounds/${campground._id}`);

}

module.exports.showCampground = async (req, res)=>{
    //destruct the id from req.params
    const {id} = req.params
    //find the campground in the database and then populate it with  reviews
    //populate() is adding the reviews content to the campground
    //the path of reviews makes it so every review will be populated with author and the final
    //populate will populate the campground with the autor of the campground
    const campground = await Campground.findById(id).populate({path: 'reviews', populate: {path: 'author'}}).populate('author')
    //flash error if campground is not found
    if(!campground){
        req.flash('error','Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    //renders the specific campground page using the specified view
    res.render('campgrounds/show', {campground})
}
module.exports.renderEditForm = async (req, res)=>{
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
}

module.exports.updateCampground = async (req, res)=>{
    
    //destruct the id from req.params
    const {id} = req.params;
    const campground = await Campground.findById(id)
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    //finds the campground in the database and then updates it with the req.body info
    const camp = await Campground.findByIdAndUpdate(id, {...req.body})
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
    camp.images.push(...imgs);
    await camp.save()
     if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({$pull: {images:{filename: {$in: req.body.deleteImages}}}})
     }
    //set the flash msg and then showing it
    req.flash('success','Successfully updated the campground!')
    //redirects to that specific campground
    res.redirect(`/campgrounds/${camp._id}`)
}
module.exports.deleteCampground = async (req, res)=>{
    //destruct the id from req.params
    const {id} = req.params;
    //finds the campground and then deletes it
    await Campground.findByIdAndDelete(id)
    //delete flash msg
    req.flash('success','Successfully deleted the campground!')
    //redirect to all campgrounds
    res.redirect('/campgrounds')
}

const User = require('../models/user')
const {catchAsync} = require('../utils/catchAsync')
module.exports.renderRegister = (req, res)=>{
    res.render('users/register')
}
module.exports.createUser = async (req, res)=>{
    //checks for errors
    try{
        //deconstruct email, user and pass from req.body
        const {email, username, password} = req.body
        //creates a new user with email and username and then adds in the password
        const user = new User({email, username})
        const registeredUser = await User.register(user, password)
        //log the user in after registering
        req.login(registeredUser, err =>{
            if(err) return next(err);
            //if successfull, redirect to campgrounds and how a message
            req.flash('success','Welcome to YelpCamp')
            res.redirect('./campgrounds')
        })
        
    } catch(e){
        //if there is an error, redirect to register again and show an error
        req.flash('error',e.message)
        res.redirect('/register')
        
    }
 
}
module.exports.renderLogin = (req, res)=>{
    res.render('users/login')
}
module.exports.login = (req, res)=>{
    req.flash('success','Welcome back')
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo;
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res)=>{
    
    req.logout(catchAsync);
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
}



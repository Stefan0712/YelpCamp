
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
const express = require('express')
const app = express()
const path = require('path')
//schema used for JOI (validating and error handling?)
const {campgroundSchema} = require('./schemas.js')
const {reviewSchema} = require('./schemas.js')

//mongoose 
const mongoose = require('mongoose')

const Review = require('./models/review')
const Campground = require('./models/campground')
const User = require('./models/user')

//package for the ejs view engine
const ejsMate = require("ejs-mate")
//package used for tricking forms into sending delete requests
const methodOverride = require("method-override")

//middleware created to handle errors
const catchAsync = require('./utils/catchAsync')

//routes from the 'routes' folder
const campgrounds = require('./routes/campground')
const reviews = require('./routes/reviews')
const users = require('./routes/users')
//middleware for error handling
const ExpressError = require('./utils/ExpressError')
//package used for session management and flash messages
const session = require('express-session')
const flash = require('connect-flash')

const passport = require('passport')
const LocalStrategy = require('passport-local')


//connects to mongoose db
mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});    
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () =>{
    console.log("Database connected")
})

//this is a middleware that extracts the data sent from an HTML form and adds it to the request object as a key-value pair
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
//servers the 'public' folder so we can use images, scripts and other resources
//when added in the boilerplate or other view, we use '/fileName'
app.use(express.static(path.join(__dirname, 'public')))
app.use(flash())

//config for session
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        //security thing
        httpOnly: true,
        //makes the cookie to expire after a week, counting form the moment of creation
        // (Date.now + 1sec * 60 sec * 60 min * 24h * 7days )
        expires: Date.now() + 1000* 60 * 60 * 24 * 7,
        //gives the cookie a life of maximum a week
        maxAge: 1000* 60 * 60 * 24 * 7
    }
}
//enabled the session using the config created earlier
app.use(session(sessionConfig))


//must be bellow session
//enable the use of auth middleware
app.use(passport.initialize())
//used to remember the login session 
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


//middleware used to validate the review
const validateReview = (req, res, next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    }else{
       next();
    }
}
//this middleware make the flash message available to any route (must be before routes var)
// must add "<%=success%>" to the boilerplate ejs
app.use((req, res, next)=>{
    //saving current user state to locals
    res.locals.currentUser = req.user;
    //this saves the flash msg to the local variable under the key 'success'
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})





//uses the routes from "routes" folder
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)
app.use('/', users)
//set ejsMate instead of ejs
app.engine('ejs', ejsMate)
//set ejs as view engine 
app.set('view engine', 'ejs')
//set the path of the view to be dynamic I guess?
app.set('views', path.join(__dirname,'views'))


//route for index page
app.get('/',(req, res)=>{
    res.render("home")
})


//this runs only if there is no match for the prev routes (order is important)
app.all('*',(req, res, next)=>{
    next(new ExpressError("Page Not Found", 404))
})
//route for showing an error for incorrect or nonexistent route
app.use((err, req, res, next)=>{
    const {statusCode= 500} = err
    if(!err.message) err.message = "Oh no, something went wrong!"
    res.status(statusCode).render('error', {err})
})


//set the app to listen on port 3000
app.listen(3000, ()=>{
    console.log('The app is running on port 3000!')
})
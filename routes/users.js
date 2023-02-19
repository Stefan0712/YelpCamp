const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const users = require('../controllers/users')



//route for logging out
router.get('/logout',users.logout)
//router.route helps to clean things up. It is used when we have more verbs for the same route.
router.route('/register')
    //renders the form
    .get(users.renderRegister)
    //route for submitting the new user
    .post(catchAsync(users.createUser))
router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)


module.exports = router
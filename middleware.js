


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

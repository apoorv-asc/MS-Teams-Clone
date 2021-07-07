const config=require('config');
const express=require('express');
const app=express();

var passport             = require("passport");
var LocalStrategy        = require("passport-local");
var passportLocalMongoose= require("passport-local-mongoose");

app.use(require("express-session")({
    secret:"Yeh Jawani Hai Deewani",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());


// @type    middleware
// @desc    Checks if the user is logged in or not. If it is logged in, it allows
//          the routes to perform its task. Else it redirects to login page
// @access  by routes
module.exports= function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect('/login');
    }
};
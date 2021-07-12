const express = require('express');
const app = express();
const router = express.Router();

// Body Parser helps to transfer data in forms from one route to other
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

// Libraries needed for authentication
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

// @@@@@@@@@@@@@@@@@@@@@@@@ Models @@@@@@@@@@@@@@@@@@@@@@@@
var User = require('../models/user') 


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// =============================================================================================================================================

// @route   GET login/
// @desc    Redirects to the login page
// @access  Public
router.get('/',(req,res)=>{
    res.render("login");
})


// @route   POST login/
// @desc    Logs in a registered user
// @access  Public
router.post("/",
    passport.authenticate("local",{

        // Redirects to the home page on successful login
        successRedirect:'/',

        // Redirects to the login page if login fails
        failureRedirect:"/login"
    })
);
module.exports = router;
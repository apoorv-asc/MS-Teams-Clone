const express = require('express');
const app = express();
const router = express.Router();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));


var passport             = require("passport");
var LocalStrategy        = require("passport-local");
var passportLocalMongoose= require("passport-local-mongoose");
  
app.use(require("express-session")({
    secret:"Yeh Jawani Hai Deewani",
    resave:false,
    saveUninitialized:false
}));

var User = require('../models/user') 

app.use(passport.initialize());
app.use(passport.session());

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
        successRedirect:'/',
        failureRedirect:"/fail"
    })
);
module.exports = router;
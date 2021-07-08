const express = require('express');
const app = express();
const router = express.Router();


app.use(express.urlencoded({ extended: true }))
app.use(express.json());  

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

const User = require('../models/user');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const UserData = require('../models/UserData');

const isLoggedIn = require('../middleware/auth')
// =============================================================================================================================================

// @route   GET registeration/
// @desc    Redirects to registration page
// @access  Public
router.get('/',(req,res)=>{
    res.render("register");
})


// @route   POST registeration/
// @desc    Registers a new user
// @access  Public
router.post('/',function(req,res){
    User.register(new User({username:req.body.username}),req.body.password, function(err){
        if(err){
            console.log(err.message);
            res.send(req.body.username+" "+req.body.password);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.render('register_user',{email:req.body.username})
            })
        }
    })
})

// @route   POST registeration/user_info
// @desc    Saves the inforamtion of the newly created user to the DB
// @access  Private
router.post('/user_info',isLoggedIn,async (req,res)=>{
    const User = new UserData(
        {
            email:req.body.email,
            username:req.body.username,
            phone:req.body.phone,
            organization:req.body.organization
        }
    )
    await User.save();
    res.redirect('/');
})


module.exports = router;
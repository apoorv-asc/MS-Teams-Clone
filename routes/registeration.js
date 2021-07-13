const express = require('express');
const app = express();
const router = express.Router();
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

// Body Parser helps to transfer data in forms from one route to other
app.use(express.urlencoded({ extended: true }))
app.use(express.json());  

// Authentication Library
var passport             = require("passport");
var LocalStrategy        = require("passport-local");
var passportLocalMongoose= require("passport-local-mongoose");

// Passes authentication key. This key is used for hashing of password
app.use(require("express-session")({
    secret:"Yeh Jawani Hai Deewani",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@ Models @@@@@@@@@@@@@@@@@@@@@@@@@@@@
const User = require('../models/user');
const UserData = require('../models/UserData');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ++++++++++++++++++++++++++ Middlewares ++++++++++++++++++++++++++
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
    try{
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
    }catch(err){
        console.log(err);
        res.redirect('/registration');
    }
})

// @route   POST registeration/user_info
// @desc    Saves the inforamtion of the newly created user to the DB
// @access  Private
router.post('/user_info',isLoggedIn,async (req,res)=>{
    try{
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
    }catch(err){
        res.render('register_user',{email:req.body.email})
    }
})

// @route   GET registeration/forgot_password
// @desc    Displays the page which helps to set new password
// @access  Public
router.get('/forgot_password',(req,res)=>{
    res.render('ForgotPass');
})


// @route   POST registeration/forgot_password
// @desc    Sends the link to the mail. This link redirects the user to a page where they can reset the password
// @access  Public
router.post('/forgot_password',async (req,res)=>{
    try{
        var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '',
            pass: ''
        }
        });
        let id=uuidv4();

        let resetUser =await UserData.findOne({email:req.body.email});
        resetUser.reset.push(id);
        await resetUser.save();

        // Details of the mail to be sent to the user trying to reset his/her password
        var mailOptions = {
        from: '',
        to: req.body.email,
        subject: 'Microsoft Teams Clone - Password Recovery',
        html:'Proceed to the following URL http://localhost:5000/registeration/recover/'+id+'/'+req.body.email+' to reset the password</p>'
        };

        // Sends the mail
        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            res.redirect('/registeration/forgot_password');
        } else {
            res.render('mailSent');
        }
        });
    }catch(err){
        console.log(err);
        res.redirect('/registeration/forgot_password');
    }
})

// @route   GET registeration/recover/:id/:email
// @desc    Resets the password of user whose email is :email and has :id in its reset variable
// @access  Public
router.get('/recover/:id/:email',async (req,res)=>{

    try{
        // There might come a scenario where someone could manipulate the URL and try to reset the password of some other user.
        // In order to prevent this, we earlier added a unique ID in the reset array present in UserData. If both the ID and 
        // the :email are present in the same user we can conclude that the user who recieved the mail is trying to reset the password
        const resetUser = await UserData.findOne({reset:req.params.id});
        if(resetUser!=null){
            if(resetUser.email==req.params.email){
                
                // Removes the :id from the array so that same link recieved on mail can't be used multiple times to reset the password
                resetUser.reset.pull(req.params.id);
                resetUser.save();
                // Renders the page which asks new password
                res.render('ForgotPassReset',{email:req.params.email});
            }else{
                // Rendered if user was not same (someone probably manipulated the URL)
                res.render('resetMailLinkExpired');
            }
        }else{
            // Rendered if either someone manipulated the URL or the link was already used
            res.render('resetMailLinkExpired');
        }
    }catch(err){
        console.log(err);
        res.redirect('/');
    }
})

// @route   POST registeration/change_password
// @desc    Stores the new password and redirects to the login page
// @access  Public 
router.post('/change_password',async (req,res)=>{
    User.findByUsername(req.body.email).then((sanitizedUser)=>{
        if (sanitizedUser){
            sanitizedUser.setPassword(req.body.password, function(){
                sanitizedUser.save();
                res.redirect('/');
            });
        }
    })
})

module.exports = router;
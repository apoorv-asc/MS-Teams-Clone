const express = require('express');
const app =express();
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// +++++++++++++++++++++++ Middlewares +++++++++++++++++++++++
const isLoggedIn = require('../middleware/auth');

// +++++++++++++++++++++++++ Models +++++++++++++++++++++++++
const UserData = require('../models/UserData')
const Meet = require('../models/meet');
const Team = require('../models/team')
const Chat = require('../models/Chat')

// ============================== Routes ==========================================

// @route   GET team/leave_team/:name
// @desc    Leaves the selected team
// @access  Private
router.get('/leave_team/:team',isLoggedIn,async (req,res)=>{
    // Removes the team name from the LoggedIn User's UserData models 
    await UserData.updateOne(
        {email:res.locals.user.username},
        {$pull:{team_name:{name:req.params.team}}}
    );

    // Removes the name of the Logged In User from the selected team's Team model
    await Team.updateOne(
        {team_name:req.params.team},
        {$pull:{members:{member:res.locals.user.username}}}
    )

    res.redirect('/');
})

// @route   GET team/:name
// @desc    Shows the ongoing calls and an option to start a new call
// @access  Private
router.get('/:name',isLoggedIn,async (req,res)=>{

    try{
        
        // Finds the information about the team whose name is :name
        var team = await Team.findOne({team_name:req.params.name});
        // Finds all the calls whose team name is :name
        var allCalls = await Meet.find({team_name:req.params.name});

        // Renders the page team's page showing all the calls
        res.render('teams_callSection',{calls:allCalls,teamInfo:team})
    }catch(err)
    {
        console.log(err);
        res.redirect('/');
    }
    
})

// @route   GET team/:name/start_call
// @desc    Starts a new group call
// @access  Private
router.get('/:name/start_call/:username',isLoggedIn,async (req,res)=>{
    
    // Returns a unique ID. This ID is used as the Room ID during the video call
    let id=uuidv4();
    try{
        // Finds the information about the user who started the video call
        const user = await UserData.findOne({email:req.params.username});
        // Saves the information about the video call in the Database
        const meet = new Meet({
            team_name:req.params.name,
            callID:id,
            count:0,
            host:user.username
        });
        await meet.save();
        
        const chat = new Chat({ChatID:id});
        await chat.save();

        // Redirects to video call page
        res.redirect(`/team/${req.params.name}/${id}`);
    }catch(err){
        console.log(err);
    }
})


// @route   GET team/info/:team
// @desc    Displays the list of all the participants and their information
// @access  Private
router.get('/info/:team',isLoggedIn,async (req,res)=>{
    const team = await Team.findOne({team_name:req.params.team});
    const users = await UserData.find({"team_name.name":req.params.team})
    res.render('team_info',{team:team,users:users});
})


// @route   GET team/attndc/:callID
// @desc    Displays the attendance of the video call
// @access  Private
router.get('/attndc/:team/:callID',isLoggedIn,async (req,res)=>{
    var team = await Team.findOne({team_name:req.params.team});
    var meet =await Meet.findById(req.params.callID);
    // Renders to the page which shows list of all the participants who entered the meeting
    // along with the time when the joined and left it
    res.render('attendance',{team:team,meet:meet});
})


// @route   GET team/:name/:room
// @desc    Joins a call using an ID
// @access  Private
router.get('/:name/:room',isLoggedIn,async (req,res)=>{
    var meet =await Meet.findOne({callID:req.params.room});
    meet.count=meet.count+1;
    meet.attndc.unshift({
        participant:res.locals.user.username,
        objective:"Entered",
        time: new Date()
    })
    await meet.save();
    res.render('room',{roomId:req.params.room,channel:req.params.name});    
})

// @route   GET team/leave/:name/:room
// @desc    Leaves a call
// @access  Public
router.get('/leave/:name/:room',async (req,res)=>{
    var meet =await Meet.findOne({callID:req.params.room});
    meet.count=meet.count-1;
    meet.attndc.unshift({
        participant:res.locals.user.username,
        objective:"Exit",
        time: new Date()
    })
    await meet.save();
    res.redirect('/team/'+req.params.name);
})

module.exports = router;
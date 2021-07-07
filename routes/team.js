const express = require('express');
const app =express();
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const isLoggedIn = require('../middleware/auth');

const Team = require('../models/team');
const Meet = require('../models/meet');

// @route   GET team/:name
// @desc    Shows the ongoing calls and an option to start a new call
// @access  Public
router.get('/:name',(req,res)=>{
    Meet.find({team_name:req.params.name},(err,allCalls)=>{
        if(err)
            throw err;
        else{
            res.render('teams_callSection',{calls:allCalls,team:req.params.name});
        }
    })
})

// @route   GET team/:name/start_call
// @desc    Starts a new group call
// @access  Public
router.get('/:name/start_call',async (req,res)=>{
    let id=uuidv4();
    try{
        Team.findOne({team_name:req.params.name},(err,team)=>{
            if(err){
                console.log(err);
                res.send(err);
            }else{
                team.incoming.unshift({call:id});
                const meet = new Meet({
                    team_name:req.params.name,
                    callID:id,
                    count:0
                });
                meet.save((err)=>{
                    if(err){
                        console.log("Error in meet");
                        res.send(err);
                    }else{
                        team.save((err)=>{
                            if(err){
                                res.send(err);
                            }else
                                res.redirect(`/team/${req.params.name}/${id}`);
                        });
                    }
                });
                
            }
        })
    }catch(err){
        console.log(err);
    }
})

// @route   GET team/:name/:room
// @desc    Joins a call using an ID
// @access  Public
router.get('/:name/:room',(req,res)=>{

    Meet.updateOne(
        {callID:req.params.room},
        {$inc:{count:1}},
        ()=>{
            res.render('room',
                {roomId:req.params.room,channel:req.params.name}
            )
        }
    )    
})

// @route   GET team/leave/:name/:room
// @desc    Leaves a call
// @access  Public
router.get('/leave/:name/:room',async (req,res)=>{
    await Meet.updateOne(
        {callID:req.params.room},
        {$inc:{count:-1}}
    )
    res.redirect('/team/'+req.params.name);
})

module.exports = router;
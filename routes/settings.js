const express = require('express');
const app = express();
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const User=require('../models/user');
const Team=require('../models/team');
const Chat = require('../models/Chat');
const UserData = require('../models/UserData');

const isLoggedIn = require('../middleware/auth')

router.get('/profile',async (req,res)=>{
    const user =await UserData.findOne({email:res.locals.user.username})
    res.render('profile',{user:user});
})

router.post('/profile',async (req,res)=>{
    try{
        var user =await UserData.findOne({email:res.locals.user.username});
        user.username=req.body.username;
        user.organization = req.body.organization;
        user.phone = req.body.phone;
    
        await user.save();
        res.redirect('/');
    }
    catch(err){
        res.send(err)
        res.redirect('/')
    }
})

// @route   GET settings/new_team
// @desc    Creates a new Team
// @access  Private
router.get("/new_team",isLoggedIn,async (req,res)=>{
    const allUsers=await User.find({});
    res.render("new_team",{users:allUsers});
});


// @route   POST settings/new_team
// @desc    Creates a new team
// @access  Private
router.post('/new_team',isLoggedIn,async (req,res)=>{
    try{
        let id=uuidv4();
        const team=new Team({
            team_name:req.body.team_name,avatar:req.body.avatar,ChatID:id,host:res.locals.user.username
        })
        for(x=0;x<(req.body.members).length;x++){
            let userinfo =await UserData.findOne({email:(req.body.members)[x]});
            console.log(userinfo.email+" "+userinfo.username+" "+(req.body.members)[x]);
            if(!userinfo)
                console.log(`${(req.body.members)[x]} not found`);
            else{
                userinfo.team_name.unshift({name:req.body.team_name})
                userinfo.save();
            }
            
            team.members.unshift({member:(req.body.members)[x]});
        }
        await team.save();
        const teamChat = new Chat({ChatID:id});
        await teamChat.save();
        res.redirect('/')
    }catch(err){
        console.log(err+" <== Error");
        res.redirect('/')
    }
})

// @route   GET settings/reset
// @desc    Renders the page where the logged in user can reset the password
// @access  Private
router.get('/reset',isLoggedIn,(req,res)=>{
    res.render("PassReset");
})

// @route   POST settings/new_team
// @desc    Resets the password
// @access  Private
router.post('/reset',isLoggedIn,(req,res)=>{
    User.findByUsername(res.locals.user.username).then((sanitizedUser)=>{
        if (sanitizedUser){
            sanitizedUser.setPassword(req.body.pass, function(){
                sanitizedUser.save();
                res.redirect('/settings/profile');
            });
        }
    })
})

// @route   POST settings/new_team
// @desc    Renders the page used for editing the team
// @access  Private
router.get('/manage_team/:team',isLoggedIn,async (req,res)=>{
    let team = await Team.findOne({team_name:req.params.team});
    let users = await UserData.find({"team_name.name":{$not: {$regex:`${req.params.team}`}}})
    res.render('manage_team',{team:team,addUsers:users})
})

// @route   POST settings/new_team
// @desc    Edits the team and redirects to homepage
// @access  Private
router.post('/manage_team/:team',isLoggedIn,async (req,res)=>{
    try{
        var team=await Team.findOne({team_name:req.params.team});
        // Change team name and avatar
        team.team_name=req.body.new_teamname;
        team.avatar = req.body.new_avatar;
        await team.save();

        // Reflect team name change in UserData
        var users=await UserData.find({"team_name.name":req.params.team});
        users.forEach((user)=>{
            (user.team_name).forEach((team)=>{
                if(team.name==req.params.team)
                    team.name=req.body.new_teamname;
            })
        })

        if(req.body.remove_members != undefined){
            // Deleting members from Team
            // Deleting Team name from UserData
            if(!Array.isArray(req.body.remove_members)){
                await Team.updateOne({team_name:req.body.new_teamname},{$pull: {members:{member:req.body.remove_members}}})
                await UserData.updateOne({email:req.body.remove_members},{$pull:{team_name:{name:req.body.new_teamname}}})
            }else{
                (req.body.remove_members).forEach(async (person)=>{
                    await Team.updateOne({team_name:req.body.new_teamname},{$pull: {members:{member:person}}})
                    await UserData.updateOne({email:person},{$pull:{team_name:{name:req.body.new_teamname}}})
                })
            }

        }

        if(req.body.add_members != undefined){
            // Adding members to team
            // Adding Team Name in UserData
            if(!Array.isArray(req.body.add_members)){
                await Team.updateOne({team_name:req.body.new_teamname},{$push:{members:{member:req.body.add_members}}})
                await UserData.updateOne({email:req.body.add_members},{$push:{team_name:{name:req.body.new_teamname}}})
            }else{
                (req.body.add_members).forEach(async (person)=>{
                    await Team.updateOne({team_name:req.body.new_teamname},{$push:{members:{member:person}}});
                    await UserData.updateOne({email:person},{$push:{team_name:{name:req.body.new_teamname}}})
                })
            }
        }
        res.redirect(`/`);
    }catch(err){
        console.log(err);
        res.redirect('/');
    }
})


module.exports = router;
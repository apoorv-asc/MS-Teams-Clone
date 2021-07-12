const express = require('express');
const app = express();
const router = express.Router();

const User=require('../models/user');
const Team=require('../models/team');
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
    }
})

// @route   GET settings/new_team
// @desc    Creates a new Team
// @access  Private
router.get("/new_team",isLoggedIn,function(req,res){
    User.find({},(err,allUsers)=>{
        if(err)
            console.log(err.messaage);
        else{
            res.render("new_team",{users:allUsers});
        }
    })
});


// @route   POST settings/new_team
// @desc    Creates a new team
// @access  Private
router.post('/new_team',isLoggedIn,async (req,res)=>{
    try{
        const team=new Team({
            team_name:req.body.team_name,avatar:req.body.avatar
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
        team.save();
    
        res.redirect('/')
    }catch(err){
        console.log(err+" <== Error");
    }
})

router.get('/reset',(req,res)=>{
    res.render("PassReset");
})

router.post('/reset',(req,res)=>{
    User.findByUsername(res.locals.user.username).then((sanitizedUser)=>{
        if (sanitizedUser){
            sanitizedUser.setPassword(req.body.pass, function(){
                sanitizedUser.save();
                res.send('Password changed');
            });
        }
    })
})

router.get('/manage_team/:team',async (req,res)=>{
    let team = await Team.findOne({team_name:req.params.team});
    let users = await UserData.find({"team_name.name":{$not: {$regex:`${req.params.team}`}}})
    res.render('manage_team',{team:team,addUsers:users})
})

router.post('/manage_team/:team',async (req,res)=>{
    var team=await Team.findOne({team_name:req.params.team});
    // Change team name and avatar
    team.team_name=req.body.new_teamname;
    team.avatar = req.body.new_avatar;

    // Reflect team name change in UserData
    var users=await UserData.find({"team_name.name":req.params.team});
    users.forEach((user)=>{
        (user.team_name).forEach((team)=>{
            if(team.name==req.params.team)
                team.name=req.body.new_teamname;
        })
    })

    // Deleting members from Team
    var cnt=0;
    (team.members).forEach((member)=>{
        if((member.member).includes(remove_members)){
            (team.members).splice(cnt,cnt+1);
        }else{
            cnt=cnt+1;
        }
    })

    // Deleting team from UserData
    var cnt=0;
    users.forEach(async (user)=>{
        if((user.email).includes(remove_member)){
            (user.team_name).forEach((team)=>{
                if(team.name==req.body.new_teamname){
                    (team.name).splice(cnt,cnt+1);
                }else{
                    cnt=cnt+1;
                }
            })
        }
        await user.save();
    })

    // Adding new member in Team
    for(x=0;x<req.body.add_member.length;x++){
        team.members.unshift(req.body.add_member[x])
    }
    await team.save();
    res.redirect('/');
})


module.exports = router;
const express = require('express');
const app = express();
const router = express.Router();

const User=require('../models/user');
const Team=require('../models/team');
const UserData = require('../models/UserData');

const isLoggedIn = require('../middleware/auth')


router.get('/',(req,res)=>{
    res.render('settings');
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
    
        res.send('Done')
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


module.exports = router;
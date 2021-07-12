const express = require('express');
const app =express();
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// @@@@@@@@@@@@@@@@@ Middlewares @@@@@@@@@@@@@@@@@@@@@
const isLoggedIn = require('../middleware/auth'); // We make any route Private by adding this as the middleware

// =================== Models ========================
const UserData = require('../models/UserData')

// +++++++++++++++++++++++++++++++++++++++ Routes +++++++++++++++++++++++++++++++++++++++++++++++

// @route   GET chat
// @desc    Shows the list of people with whom the logged in user had a conversation in the past and
//          gives an option to start a new conversation
// @access  Private
router.get('/',isLoggedIn,async (req,res)=>{

    // Selects all the users with whom the Logged In user never had a conversation
    var newChat = await UserData.find({"chat.user":{$not:{$regex:`${res.locals.user.username}`}}})

    // Selects the information about the Logged In user.
    // It contains information about all the users with whom the user had a conversation in the past
    var user = await UserData.findOne({email:res.locals.user.username})
    console.log(user.chat);
    if(newChat==null)
    newChat = [];
    res.render('chat',{chats:user,newChat:newChat,prevChat:{},id:-1});
})

// @route   POST chat/new_chat
// @desc    Starts a new conversation with the selected user
// @access  Private
router.post('/new_chat',isLoggedIn,async (req,res)=>{
    
    // Returns an unique ID which we use as the room ID for a conversation between 2 participants.
    let id =uuidv4();

    // Adds information about the new conversation in the logged in user.
    var user1 = await UserData.findOne({email:res.locals.user.username});
    user1.chat.unshift({
        user:req.body.user,
        ChatID:id
    });
    await user1.save();

    // Adds information about the new conversation in the selected user.
    var user2 = await UserData.findOne({email:req.body.user});
    user2.chat.unshift({
        user:res.locals.user.username,
        ChatID:id
    });
    await user2.save();

    // Saves the UUID in Chat model.
    var chat = new Chat({
        ChatID:id
    });
    await chat.save();
    res.redirect(`/chat/${id}`);
});

// @route  GET chat/:id
// @desc    Displays the conversation of the logged in user with the user who has ROOM_ID = id
// @access  Private
router.get('/:id',isLoggedIn,async (req,res)=>{

    // Finds users with whom the logged in user never had a conversation
    var newChat = await UserData.find({"chat.user":{$not:{$regex:`${res.locals.user.username}`}}});

    // Finds info about the logged in user because 'chat' document present in it has list of all the user with whom the user had a conversation
    var user = await UserData.findOne({email:res.locals.user.username});

    // Finds the chat of the user whose ChatID = :id
    var chat = await Chat.findOne({ChatID:req.params.id});
    res.render('chat',{chats:user,newChat,prevChat:chat,id:req.params.id})
})


module.exports = router;
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

const moment = require('moment'); // Library that helps in printing time in a more user friendly manner

const connectDB = require('./config/db'); // Connects to MongoDB database
connectDB();


app.set("view engine","ejs");
app.use(express.static("public")); // Allows the use of files present in public directory
app.use("/peerjs", peerServer);


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json({extended: false}));

// @@@@@@@@@@@@@@@@@@@@@@@@@@@ Databases @@@@@@@@@@@@@@@@@@@@@@@@@@@

var User= require('./models/user');
const UserData = require('./models/UserData');
const Meet = require('./models/meet');
const Team = require('./models/team');
const Chat = require('./models/Chat');

// ++++++++++++++++++ IMPORT for Authentication ++++++++++++++++++++++++

var passport              = require("passport");
var LocalStrategy         = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");


app.use(require("express-session")({
    secret:"Yeh Jawani Hai Deewani",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// +++++++++++++++++++ MIDDLEWARES +++++++++++++++++++++++++

const isLoggedIn = require('./middleware/auth');

// Passes the email address of logged in user to every route. 
// If no user is logged in it passes null to every route
app.use(function(req,res,next){
    res.locals.user=req.user;
    next();
})

// +++++++++++++++++++++ ROUTES ++++++++++++++++++++++++++++

app.use('/login',require('./routes/login'));
app.use('/registeration',require('./routes/registeration'));
app.use('/logout',require('./routes/logout'));
app.use('/settings',require('./routes/settings'));
app.use('/team',require('./routes/team'));
app.use('/chat',require('./routes/chat'));

// ==================== Home Screen ======================
// @Access Private
app.get('/',isLoggedIn,async (req,res)=>{
    Team.find({"members.member":res.locals.user.username},(err,teams)=>{
        if(err){
            console.log(err);
            res.redirect('/login');
        }
        else
            res.render('home',{teams:teams})
    });
})

// ===========================================================

io.on("connection", (socket) => {

    // Chat during Video Call (room.ejs)
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-connected", userId);

        socket.on("message",async (message) => {
            // Reads the chat from Database whose ChatID = roomID and appends the recieved message to it.
            var chat =await Chat.findOne({ChatID:roomId});
            console.log(roomId);
            chat.msg.push({
                message:message.msg,
                timestamp:moment().format('h:mm a'),
                username:message.user
            });
            // Saves the chat along with the new message
            await chat.save();
            console.log('Message Saved');
            // Displays the messages on the right side of the video call
            io.to(roomId).emit("createMessage", message);
            // Displays the message in the view chat option that can be accessed from team_callSection page
            // even during the video call
            io.to(roomId).emit('Show-Message', {username:message.user, msg:message.msg})
        });
    });

    // Personal Chat (chat.ejs)
    socket.on('join',(options,callback)=>{
        socket.join(options.roomId);
        
        socket.on('sendMessage',async (data, callback) => {
            console.log(data.roomId);
            const chat =await Chat.findOne({ChatID:data.roomId});
            chat.msg.push({
                username:data.username,
                message:data.message,
                timestamp:data.time,
            })
            await chat.save();
            // Displays the message in the chat page
            io.to(data.roomId).emit('Show-Message', {username:data.username, msg:data.message})
            // Displays the message on the right side of the video call
            io.to(data.roomId).emit("createMessage", {msg:data.message,user:data.username});
            callback()
        })

    })

});


// Creates a server that listens at Port 5000
const PORT=process.env.IP || 5000;
server.listen(PORT, () =>{
    console.log(`Server started on port ${PORT}`);
}); 
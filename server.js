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


const connectDB = require('./config/db');
connectDB();


app.set("view engine","ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json({extended: false}));

// @@@@@@@@@@@@@@@@@@@@@@@@@@@ Databases @@@@@@@@@@@@@@@@@@@@@@@@@@@

var User= require('./models/user');
const UserData = require('./models/UserData');
const Meet = require('./models/meet');
const Team = require('./models/team');

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

const isLoggedIn = require('./middleware/auth')

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

// ==================== TESTING PURPOSE ======================

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

app.get('/fail',(req,res)=>{
    res.send("Failed");
})

// ===========================================================

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-connected", userId);

        socket.on("message", (message) => {
          io.to(roomId).emit("createMessage", message);
        });
    });
});




const PORT=process.env.IP || 5000;
server.listen(PORT, () =>{
    console.log(`Server started on port ${PORT}`);
}); 
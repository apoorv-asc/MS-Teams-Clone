// User Modals.
// This modal contains the username (ie the email), hashed password and the hashvalue for User Authentication.
// Used by Passport.js Library to authenticate the user
var mongoose   = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var UserSchema=new mongoose.Schema({
  username:String,
  password:String
});

UserSchema.plugin(passportLocalMongoose);

 module.exports = mongoose.model("User",UserSchema);
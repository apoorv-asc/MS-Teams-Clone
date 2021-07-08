const mongoose = require('mongoose');
const UserDataSchema =new mongoose.Schema({
    username:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    organization:{
        type:String,
        required:true
    },
    team_name:[{
        name:{
            type:String,
            required:false
        }
    }] 
});

module.exports = UserData = mongoose.model('UserData',UserDataSchema);
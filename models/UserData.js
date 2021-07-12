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
    reset:[Number],
    team_name:[{
        name:{
            type:String,
            required:false
        }
    }],
    chat:[{
        user:{type:String},
        ChatID:{type:String}
    }]
});

module.exports = UserData = mongoose.model('UserData',UserDataSchema);
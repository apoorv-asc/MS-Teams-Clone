const mongoose = require('mongoose');
const TeamSchema =new mongoose.Schema({
    team_name:{
        type:String,
        required: true
    },
    members:[{
        member:{
            type:String,
            unique:true
        }
    }],
    avatar:{
        type:String,
    }
});

module.exports = Team = mongoose.model('Team',TeamSchema);
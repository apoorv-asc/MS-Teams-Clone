// Contains information about the various team
const mongoose = require('mongoose');
const TeamSchema =new mongoose.Schema({
    team_name:{
        type:String,
        required: true
    },
    members:[{
        member:{
            type:String
        }
    }],
    avatar:{
        type:String,
    },
    ChatID:{type:String},
    host:{type:String}
});

module.exports = Team = mongoose.model('Team',TeamSchema);
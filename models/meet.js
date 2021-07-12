const mongoose = require('mongoose');
const MeetSchema =new mongoose.Schema({
    team_name:{
        type:String,
        required: true
    },
    callID:{
        type:String,
        required: true
    },
    members:[{
        member:{
            type:String
        }
    }],
    count:{
        type:Number,
        default: 0
    },
    host:{
        type:String
    },
    attndc:[{
        participant:{type: String},
        objective:{type:String},
        time:{type:String}
    }]
});

module.exports = Meet = mongoose.model('Meet',MeetSchema);
const mongoose = require('mongoose');
const ChatScehma =new mongoose.Schema({
    ChatID:{
        type:String
    },
    msg:[{
        username:{type:String},
        message:{type:String},
        timestamp:{type:String}
    }]
});

module.exports = Chat = mongoose.model('Chat',ChatScehma);
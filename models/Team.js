const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    participants: {
        type: [String],
        required: false
    },
    score: {
        type: Number,
        required: true,
        default: 0
    }, 
    leedurInformation:{
        type: [Object],
        required: false
    }
})

const Team = mongoose.model('Team', TeamSchema);

module.exports = Team;
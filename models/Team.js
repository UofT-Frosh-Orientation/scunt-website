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
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true,
        default: 0
    }, 
    missionsCompleted: {
        type: [Object], // should be SubmittedMission type
        required: true
    }
})

const Team = mongoose.model('Team', TeamSchema);

module.exports = Team;
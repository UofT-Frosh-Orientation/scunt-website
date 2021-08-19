const mongoose = require('mongoose');
const Mission = require('./Mission');

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
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
        type: [Mission],
        required: true
    }
})

const Team = mongoose.model('Team', TeamSchema);

module.exports = Team;
const mongoose = require('mongoose');

// const Bribe = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     numberOfPoints: {
//         type: String,
//         required: true
//     }
// })

const JudgeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    isActivated: {
        type: Boolean,
        required: true,
        default: false
    },
    bribePointsLeft: {
        type: Number,
        default: 2500,
        required: false
    },
    accountType: {
        type: String,
        required: true,
        default: 'judge'
    }
})

const Judge = mongoose.model('Judge', JudgeSchema);

module.exports = Judge;
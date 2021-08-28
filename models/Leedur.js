const mongoose = require('mongoose');

const LeedurSchema = new mongoose.Schema({
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
    scuntTeam: {
        type: Number,
        required: true
    },
    accountType: {
        type: String,
        required: true,
        default: 'leedur'
    }
})

const Leedur = mongoose.model('Leedur', LeedurSchema);

module.exports = Leedur;
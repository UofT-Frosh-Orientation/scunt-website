const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
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
    missionSpreadsheet: {
        type: String,
        required: false
    },
    accountType: {
        type: String,
        required: true,
        default: 'admin'
    }
})

const ScuntAdmin = mongoose.model('ScuntAdmin', AdminSchema);

module.exports = ScuntAdmin;
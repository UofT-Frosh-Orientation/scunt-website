const mongoose = require('mongoose');

const EventSettingsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    revealTeams: {
        type: Boolean,
        required: false,
        default: false
    },
    startEvent: {
        type: Boolean,
        required: false,
        default: false
    },
})

const EventSettings = mongoose.model('EventSettings', EventSettingsSchema);

module.exports = EventSettings;

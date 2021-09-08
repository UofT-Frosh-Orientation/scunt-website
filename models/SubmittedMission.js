const mongoose = require('mongoose');

const SubmittedMissionSchema = new mongoose.Schema({
    name: {
		type: String,
		required: true,
	},
    number: {
		type: Number,
		required: true,
	},
    category: {
		type: String,
		required: false,
		default: "None"
	},
    status: {
		type: String,
		required: false,
	}, 
    submitter: {
		type: String,
		required: false,
		default: ''
	},
	submitterDiscordId: {
		type: String,
		required: false
	},
    submissionLink: {
		type: String,
		required: false,
	},
    achievedPoints: {
		type: Number,
		required: false,
		default: 0
	},
    totalPoints: {
		type: Number,
		required: true,
		default: 0
	},
	teamNumber: {
		type: Number,
		required: true
	},
	isMediaConsent: {
		type: Boolean,
		required: false
	},
	timeCreated:{
		type: Date,
		required: true,
		default: new Date()
	},
})

const SubmittedMission = mongoose.model('SubmittedMission', SubmittedMissionSchema);

module.exports = SubmittedMission;
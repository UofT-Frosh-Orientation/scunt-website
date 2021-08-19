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
    submissionLink: {
		type: String,
		required: false,
	},
    achievedPoints: {
		type: Number,
		required: false,
	},
    totalPoints: {
		type: Number,
		required: true,
		default: 0
	}
})

const SubmittedMission = mongoose.model('Mission', SubmittedMissionSchema);

module.exports = SubmittedMission;
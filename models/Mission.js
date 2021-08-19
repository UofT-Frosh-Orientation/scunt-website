const mongoose = require('mongoose');

const MissionSchema = new mongoose.Schema({
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
		default: ""
	},
    totalPoints: {
		type: Number,
		required: true,
		default: 0
	},
	isViewable: {
		type: Boolean,
		required: true,
		default: false
	}
})

const Mission = mongoose.model('Mission', MissionSchema);

module.exports = Mission;
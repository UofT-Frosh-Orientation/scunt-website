const mongoose = require('mongoose');
const randToken = require('rand-token');

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
    pronouns: {
        type: String,
        required: true
    },
    discordSignedIn: {
		type: Boolean,
		required: false,
		default: false
	},
	discordToken: {
		type: String,
		required: false,
		default: function () {
			return randToken.generate(12);
		}
	},
	discordUsername: {
		type: String,
		required: false,
		default: ""
	},
	discordId: {
		type: String,
		required: false,
		default: ""
	},
    accountType: {
        type: String,
        required: true,
        default: 'leedur'
    }
})

const Leedur = mongoose.model('Leedur', LeedurSchema);

module.exports = Leedur;
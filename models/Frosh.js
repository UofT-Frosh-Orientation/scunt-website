const mongoose = require('mongoose');
const randToken = require('rand-token');

const FroshSchema = new mongoose.Schema({
	// Personal Info
	fullName: {
		type: String,
		required: true
	},
	preferredName: {
		type: String,
		required: false,
		default: ''
	},
	birthdate: {
		type: String,
		required: true
	},
	pronouns: {
		type: String,
		required: true
	},
	discipline: {
		type: String,
		required: true
	},
	utorid: {
		type: String,
		required: true
	},
	medicalInfo: {
		type: String,
		required: false,
		default: ''
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		require: true
	},
	phoneNumber: {
		type: String,
		required: true
	},
	instagram: {
		type: String,
		required: false,
		default: ''
	},
	emergCCName: {
		type: String,
		required: true
	},
	emergCCRelation: {
		type: String,
		required: true
	},
	emergCCNumber: {
		type: String,
		required: true
	},
	// Shipping Info
	streetAddress: {
		type: String,
		required: true
	},
	aptSuite: {
		type: String,
		required: false,
		default: ''
	},
	country: {
		type: String,
		required: true
	},
	region: {
		type: String,
		required: true
	},
	city: {
		type: String,
		required: true
	},
	postalCode: {
		type: String,
		required: true
	},
	isResidingInCanada: {
		type: String,
		required: true
	},
	timezone:{
		required: true,
		type: String
	},
	streetAddress2: {
		type: String,
		required: false,
		default: ''
	},
	aptSuite2: {
		type: String,
		required: false,
		default: ''
	},
	country2: {
		type: String,
		required: false,
		default: ''
	},
	region2: {
		type: String,
		required: false,
		default: ''
	},
	city2: {
		type: String,
		required: false,
		default: ''
	},
	postalCode2: {
		type: String,
		required: false,
		default: ''
	},
	moreAddressInfo: {
		type: String,
		required: false,
		default: ''
	},
	// Kits & Meetups
	isDeliverPossible: {
		type: String,
		required: true
	},
	isPickupPossible: {
		type: String,
		required: true
	},
	shirtSize: {
		type: String,
		required: true
	},
	isMeetup: {
		type: String,
		required: true
	},
	isScunt: {
		type: String,
		required: true
	},
	isAgreeTerms: {
		type: Boolean,
		required: true
	},
	isMediaConsent: {
		type: String,
		required: true
	},
	// Other Required Information
	froshGroup: {
		type: String,
		required: true
	},
	kitStatus: {
		type: String,
		required: true
	},
	balance: {
		type: Number,
		required: true
	},
	nightlifeTicket: {
		type: Number,
		required: true,
		unique: true
	},
	// Account Fields
	lastUpdatedAcct: {
		type: Date,
		required: true
	},
	lastUpdatedFields: {
		type: Array,
		required: false,
		default: []
	},
	accountCreatedAt: {
		type: Date,
		required: true
	},
	// Not using for app to keep consistency between day 1 and day 2 sign in info
	signedIn: {
		type: Boolean,
		required: true,
		default: false
	},
	// Also somehow not used
	paymentConfirmed: {
		type: Boolean,
		required: true,
		default: false
	},
	resetPasswordToken: {
		type: String,
		required: false,
		default: ''
	},
	resetPasswordExpires: {
		type: Date,
		required: false,
		default: Date.now()
	},
	// In person sign ins
	signInDayOne: {
		type: Boolean,
		required: false,
		default: false
	},
	signInDayTwo: {
		type: Boolean,
		required: false,
		default: false
	},
	isQuarantine: {
		type: Boolean,
		required: false,
		default: false
	},
	requireRefund: {
		type: Number,
		required: false,
		default: 0
	},
	// Scunt Discord stuff
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
	scuntTeam: {
		type: Number, // Numeric index of scunt team -> could also just store these as strings
		required: false, // Again, not sure if this will break all the models
		default: 1
	}
});

const Frosh = mongoose.model('Frosh', FroshSchema);

module.exports = Frosh;

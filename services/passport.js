const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User model
const Frosh = require('../models/Frosh');
const ScuntAdmin = require('../models/ScuntAdmin');
const Judge = require('../models/Judge');

function SessionConstructor(userId, userType){
	this.id = userId;
	this.userType = userType;
}
module.exports = function(passport) {
	passport.use(
		'frosh', new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
			// Match user
			console.log("frosh passport strategy");
			Frosh.findOne({
				email: new RegExp(`^${email}$`, 'i')
			}).then((user) => {
				if (!user) {
					return done(null, false, { message: 'That email is not registered' });
				}
				// Match password
				bcrypt.compare(password, user.password, (err, isMatch) => {
					if (err) throw err;
					if (isMatch) {
						return done(null, user);
					} else {
						return done(null, false, { message: 'Password incorrect' });
					}
				});
			});
		})
	);

	passport.use(
		'judge', new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
			// Match user
			Judge.findOne({
				email: new RegExp(`^${email}$`, 'i')
			}).then((user) => {
				if (!user) {
					return done(null, false, { message: 'That email is not registered' });
				}
				// Match password
				bcrypt.compare(password, user.password, (err, isMatch) => {
					if (err) throw err;
					if (isMatch) {
						return done(null, user);
					} else {
						return done(null, false, { message: 'Password incorrect' });
					}
				});
			});
		})
	);

	passport.use(
		'admin', new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
			// Match user
			ScuntAdmin.findOne({
				email: new RegExp(`^${email}$`, 'i')
			}).then((user) => {
				if (!user) {
					return done(null, false, { message: 'That email is not registered' });
				}
				// Match password
				bcrypt.compare(password, user.password, (err, isMatch) => {
					if (err) throw err;
					if (isMatch) {
						return done(null, user);
					} else {
						return done(null, false, { message: 'Password incorrect' });
					}
				});
			});
		})
	);

	passport.serializeUser(function(user, done) {
		let userType = user.accountType;
		if(!userType){
			userType = 'frosh';
		}

		// console.log("serializing the user: " + user + " " + userType);
		let sessionInstance = new SessionConstructor(user._id, userType);
		done(null, sessionInstance);
	});

	passport.deserializeUser(function(sessionInstance, done) {
		// console.log("deserialize user for session: ", sessionInstance);
		if(sessionInstance.userType==="judge"){
			Judge.findById(sessionInstance.id, function(err, user) {
				done(err, user);
			});
		} else if (sessionInstance.userType==="admin"){
			ScuntAdmin.findById(sessionInstance.id, function(err, user) {
				done(err, user);
			});
		} else{
			Frosh.findById(sessionInstance.id, function(err, user) {
				done(err, user);
			});
		}
	});
};

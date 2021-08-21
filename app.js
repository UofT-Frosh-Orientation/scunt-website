const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');

// documentation - swagger
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const swaggerOptions = require('./swagger/swaggerSettings')

const app = express();
require('./services/passport')(passport);

app.use(
	session({
		secret: 'Insert randomized text here',
		resave: false,
		saveUninitialized: false,
		maxAge:{_expires : 3*24*60*1000*1000}
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See 
// http://expressjs.com/api#app-settings for more details.
app.enable('trust proxy');
app.use(function (req, res, next) {
	if (req.secure || req.headers.host === 'localhost:6969') {
		next();
	} else {
		// request was via http, so redirect to https
		console.log('redirecting');
		console.log(req.headers.host);
		res.redirect(301, 'https://' + req.headers.host + req.url);
	}
});

app.use(express.static(__dirname + '/client/build'));
app.use(passport.initialize());
app.use(passport.session());

// SWAGGER
const specs = swaggerJsdoc(swaggerOptions);
app.use(
	"/api-docs",
	swaggerUI.serve,
	swaggerUI.setup(specs, { explorer: true })
);

require ('./routes/authRoutes')(app);
require ('./routes/adminRoutes')(app);
require ('./routes/judgeRoutes')(app);
require ('./routes/participantRoutes')(app);

console.log('initialized');

// All routes other than above will go to index.html
app.get('*', (req, res) => {
	res.sendFile(__dirname + '/client/build/index.html');
});

module.exports = app;

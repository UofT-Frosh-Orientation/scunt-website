const mongoose = require('mongoose');

const mongoFroshURI = process.env.MONGO_FROSH_URI || require("../config/secretKeys").mongoFroshURI;
mongoose
	.connect(mongoFroshURI, { useNewUrlParser: true })
	.then(() => console.log('Frosh MongoDB Connected'))
	.catch((err) => console.log(err));
mongoose.set('useNewUrlParser', true);

module.exports = exports = mongoose;
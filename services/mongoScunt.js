const mongoose = require('mongoose');

const mongoScuntURI = process.env.MONGO_SCUNT_URI || require("./config/secretKeys").mongoScuntURI;
mongoose
	.connect(mongoScuntURI, { useNewUrlParser: true })
	.then(() => console.log('Scunt MongoDB Connected'))
	.catch((err) => console.log(err));
mongoose.set('useNewUrlParser', true);

module.exports = exports = mongoose;
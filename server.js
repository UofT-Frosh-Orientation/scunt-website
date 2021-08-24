// server.js
const app = require("./app");
const mongoose = require('mongoose');
const SubmittedMission = require('./models/SubmittedMission');

var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(process.env.PORT || 6969);

// Judge panel socket.io setup: 
const submissionTicketSocket = io.of('/judge-tickets');
submissionTicketSocket.on('connection', socket =>{
	console.log('submissionTicketSocket connected');
})

const mongoURI = process.env.MONGO_URI || require("./config/secretKeys").mongoURI;
mongoose
	.connect(mongoURI, { useNewUrlParser: true })
	.then(() => {
		console.log('MongoDB Connected');
		const changeStream = SubmittedMission.watch();
		changeStream.on('change',(change)=>{
            console.log('some submissions have changed')
			console.log(change);
			submissionTicketSocket.emit('submissionsChanged', change);
		});
	})
	.catch((err) => console.log(err));
mongoose.set('useNewUrlParser', true);

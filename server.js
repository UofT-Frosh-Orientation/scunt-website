// server.js
const app = require("./app");
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || require("./config/secretKeys").mongoURI;
mongoose
	.connect(mongoURI, { useNewUrlParser: true })
	.then(() => console.log('MongoDB Connected'))
	.catch((err) => console.log(err));
mongoose.set('useNewUrlParser', true);


var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(process.env.PORT || 6969);

// Judge panel socket.io setup: 
// io.on('connection', socket =>{
// 	console.log('user connected');
// })
const submissionTicketSocket = io.of('/judge-tickets');
submissionTicketSocket.on('connection', socket =>{
	console.log('a user has joined submissionTicketSocket')
	socket.on('getNewTickets', (data)=>{
		socket.broadcast.emit('getNewTickets', data);
	});
	socket.on('updateStatus', (data)=>{
		socket.broadcast.emit('updateStatus', data);
	});
})


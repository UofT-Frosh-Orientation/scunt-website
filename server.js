// server.js
const app = require("./app");

const mongoose = require('mongoose');

const mongoScuntURI = process.env.MONGO_SCUNT_URI || require("./config/secretKeys").mongoScuntURI;
mongoose
	.connect(mongoScuntURI, { useNewUrlParser: true })
	.then(() => console.log('Scunt MongoDB Connected'))
	.catch((err) => console.log(err));
mongoose.set('useNewUrlParser', true);

var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(process.env.PORT || 6969);

io.on('connection', socket =>{
	console.log('user connected');
})

const questionNsp = io.of('/question');
questionNsp.on(`connection`, socket =>{
	console.log('a user has joined questionSocket')
	socket.on('addNewVote', (data)=>{
		socket.broadcast.emit('addNewVote', data);
	});
	socket.on('changeVote', (data)=>{
		socket.broadcast.emit('changeVote', data);
	});
	socket.on('deleteVote', (data)=>{
		console.log('recieved delete vote');
		socket.broadcast.emit('deleteVote', data);
	});
})


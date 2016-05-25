var _ = require('lodash');
var bot = require('./bot.js');

var messages = [];
var names = ['Wolverine', 'Hare', 'Lion', 'Jeboa', 'Aoudad', 'Crow'];

function getName(){ //chose random name for the list
	var index = _.random(names.length - 1);
	var name = names[index];

	names.splice(index, 1);
	return name;
}

module.exports = io => {
	io.on('connection', (socket) => {
		socket.name = getName(); //get a random name from the list
		socket.emit('user', socket.name); //inform the user with his name
		console.log('new user connected with name ' + socket.name + '!');

		for(message of messages) //send the new user all the 
			socket.emit('message', message);

		socket.on('message', (message) => {
			var botResponse = bot.parseMessage(socket.name, message); //check if bot has a response for this message
			var message = {
				user: socket.name, 
				text: message
			};

			messages.push(message); //add the message to the list
			io.emit('message', message); //send it to everyone
			if(botResponse){ //if the bot has a response, save and send it
				var botMessage = {
					user: 'B0T',
					text: 'BEEP BOOP ' + botResponse
				};

				messages.push(botMessage);
				io.emit('message', botMessage);
			}
		});
	});
}
// App
var app = angular.module('app', ['app.socket', 'ngSanitize']);

// App controller
app.controller('appController', ['$scope', 'socket', function($scope, socket) {
	$scope.messages = []; //message list
	$scope.message = ''; //my message
	$scope.currentUser = ''; //my current username

	socket.on('message', message => { //on new message, add it
		$scope.messages.push(message);
	});

	socket.on('user', user => { //save the username
		$scope.currentUser = user;
	});

	$scope.sendMessage = () => { //send the message
		socket.emit('message', $scope.message);
		$scope.message = '';
	}

	$scope.detectEnter = event => { //on enter press also send the message
		if(event.code === 'Enter')
			$scope.sendMessage();
	}

	$scope.getUserClass = message => { //get the class of a username
		if(message.user === $scope.currentUser)
			return 'user-current';
		else if(message.user === 'B0T')
			return 'user-bot';
		else
			return 'user';
	}

	$scope.parseMessage = message => { //get the html inside the message span
		var text = '';
		var words = message.text.split(' ');
		for(var word of words){
			if(word[0] === '@'){ //if the word starts with @ add the appropriate class for this word as its a username
				var user = word.substring(1);
				if(user === $scope.currentUser)
					text += '<span class="user-current-mentioned"><b>' + user + '</b></span> '
				else
					text += '<span class="user-mentioned"><b>' + user + '</b></span> '
			}
			else
				text += word + ' ';
		}

		return text;
	}
}]);
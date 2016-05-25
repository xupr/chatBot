angular.
	module('app.socket', []).
	factory('socket', ['$rootScope', function($rootScope){ //a small socket factory which connects to the server and provides the on and emit methods which also rerender
		var socket = io.connect('http://localhost:3000');
		return {
			on: function(name, callback){
				socket.on(name, data => {
					$rootScope.$apply(() => { //update the scope
						callback.call(socket, data);
					});
				});
			},

			emit: function(name, data, callback){
				socket.emit(name, data, data => {
					var args = arguments;

					$rootScope.$apply(() => { //update the scope
						callback.apply(socket, args);
					});
				});
			}
		};
	}]);
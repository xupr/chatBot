var _ = require('lodash');
var fs = require('fs');
var responses = JSON.parse(fs.readFileSync(__dirname + '/botResponses.json', 'utf8'));
var questionParser = require('./question.js');

function Bot(){
	//create arrays for questions
	this.unansweredQuestions = [];
	this.answeredQuestions = [];
}

Bot.prototype.parseMessage = function(user, message){
	var response = _.find(responses, {command: message}); //check if there is a default response
	if(response)
		return response.response;
	
	if(message[0] === '@'){ //check if the message is an answere and save it
		var name = ''
		var i = 1;
		while(i < message.length && message[i] != ' ')
			name += message[i++];

		if(i === message.length)
			return;

		for(var unansweredQuestion of this.unansweredQuestions){
			if(unansweredQuestion.user === name){
				this.answeredQuestions.push({
					question: new questionParser(unansweredQuestion.question),
					answer: message.substring(i)
				});

				break;
			}
		}

		return;
	}

	if(!_.endsWith(message, '?')) //check if the message is an question
		return;

	for(var answeredQuestion of this.answeredQuestions){ //check if the question has been asked before, else save it
		var parsedQuestion = new questionParser(message);
		if(questionParser.areQuestionsMatching(answeredQuestion.question, parsedQuestion))
			return answeredQuestion.answer;
	}

	this.unansweredQuestions.push({
		question: message,
		user: user
	});
};

module.exports = new Bot();
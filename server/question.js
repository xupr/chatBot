var _ = require('lodash');
var pos = require('pos');
var WordNet = require('node-wordnet');
var deasync = require('deasync');

function arrayDifference(arr1, arr2){ //returns the items that are in one array but not in the second
	return _.concat(_.difference(arr1, arr2), _.difference(arr2, arr1));
}

function arraySimmilarity(arr1, arr2){ //return the items that are in both arrays
	return _.uniq(_.filter(_.concat(_.uniq(arr1), _.uniq(arr2)), function (value, index, iteratee) {
	   return _.includes(iteratee, value, index + 1);
	}));
}

function Question(question){
	this.parse(question);
}

Question.prototype.parse = function(question){
	question = _.toLower(question); //lower case for comparison
	//create an array for all needed pos types
	this.w = [];
	this.v = [];
	this.j = [];
	this.rest = [];

	var wordnet = new WordNet(); //parse the question for pos parts
	var words = new pos.Lexer().lex(question);
	var tagger = new pos.Tagger();
	var taggedWords = tagger.tag(words);
	for(taggedWord of taggedWords){
		if(taggedWord[1][0] === 'W') //if it is a wh-question word, save it accordingly
			this.w.push(taggedWord[0]);
		else if(taggedWord[1][0] === 'V') //if it is a verb, save it accordingly
			this.v.push(taggedWord[0]);
		else if(taggedWord[1][0] === 'J' || taggedWord[1][0] === 'R'){ //if it is an adjective or an adverb, save it accordingly with its' synonyms
			var ret = null;
			wordnet.lookup(taggedWord[0], function(results){
				var synonyms = [];
				for(var result of results){
					if(result.pos === 'a' || result.pos === 's' || result.pos === 'r') //if the definition is of an adjective or an adverb save the synonyms 
					synonyms = _.concat(synonyms, result.synonyms);
				}
				
				ret = _.uniq(synonyms);
			});

			while(ret === null) //some ugly deasync for simplicity :(
				deasync.runLoopOnce();

			this.j.push({
				word: taggedWord[0],
				synonyms: ret
			});
		}else if(taggedWord[0] !== '?') //push everything else excpet the question mark
			this.rest.push(taggedWord[0]);
	}
};

Question.areQuestionsMatching = (question1, question2) => {
	if(arrayDifference(question1.w, question2.w).length !== 0) //the wh-question words must match
		return false;

	if(arrayDifference(question1.v, question2.v).length !== 0) //the verbs must match
		return false;

	//the adjectives and adverbs must match or be synonyms
	for(var j1 of question1.j){
		var found = false;
		for(var j2 of question2.j){
			if(_.indexOf(j2.synonyms, j1.word) !== -1){
				found = true;
				break;
			}
		}

		if(!found)
			return false;
	}

	for(var j2 of question2.j){
		var found = false;
		for(var j1 of question1.j){
			if(_.indexOf(j1.synonyms, j2.word) !== -1){
				found = true;
				break;
			}
		}

		if(!found)
			return false;
	}

	//at least half of the rest of the pos's of the shortes one must match
	if(arraySimmilarity(question1.rest, question2.rest).length <= 0.5*_.min([question1.rest.length, question2.rest.length])) 
		return false;

	return true;
}

module.exports = Question;
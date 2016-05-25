module.exports = app => { //only the index page here
	app.get('/', function(req, res) {
		res.sendfile('./public/index.html');
	});
};
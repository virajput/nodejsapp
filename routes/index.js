var express = require('express'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

var router = express.Router();

var db_name = 'moviedb';
var mongodb_connection_string = 'mongodb://localhost:27017/' + db_name;

//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
	mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + db_name;
}

console.log("mongo url " + mongodb_connection_string);

MongoClient.connect(mongodb_connection_string, function(err, db) {

    assert.equal(null, err);
    console.log("Successfully connected to MongoDB.");

    router.get('/list', function(req, res, next) {
		var output = { data: [] };
        db.collection('movies').find({}).toArray(function(err, docs) {
			//res.render('movies', { 'movies': docs } );
			docs.forEach(function(doc) {
				output.data.push(doc);
			});
			res.contentType('application/json');
			res.json(output);
        });
    });
	
	router.get('/', function(req, res, next) {
		res.render('index',{});
	});
	
    router.post('/addmovie', function(req, res, next) {
        var title = req.body.title;
        var year = req.body.year;
        var imdb = req.body.imdb;
        
        if ((title == '') || (year == '') || (imdb == '')) {
            next('Please provide an entry for all fields.');
        } else {
            db.collection('movies').insertOne(
                { 'title': title, 'year': year, 'imdb': imdb },
                function (err, r) {
                    assert.equal(null, err);
                    //res.render('index', {});
                    res.redirect('/');
                }
            );
        }
    });
});

module.exports = router;

var mongo = require('mongoskin');
var db = mongo.db('mongodb://127.0.0.1:27017/uscclasses', {native_parser: true});

var departments = db.collection('departments');

exports.find = function(req, res){
	departments.findOne({code: req.params.q}, function(err, doc){
		if (err) throw err;
		res.send(doc);
	})
}

exports.list = function(req, res){
	departments.find().toArray(function(err, ary){
		if (err) throw err;
		res.send(ary);
	})	
}
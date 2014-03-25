var mongo = require('mongoskin');
var db = mongo.db('mongodb://127.0.0.1:27017/uscclasses', {native_parser: true});

var classes = db.collection('classes');

exports.search = function(req, res){
  classes.find({$or: [{'uscid': req.params.q}, {'prefix': req.params.q}, {'number': req.params.q}]}).toArray(function(err, doc){
  	if (err) throw err;
  	res.send(doc);
  })
};

exports.find = function(req, res){
	classes.findOne({'uscid': req.params.q}, function(err, doc){
		if (err) throw err;
		res.send(doc);
	})
}

exports.list = function(req, res){
	classes.find({}, {uscid: 1, prefix: 1, number: 1}).toArray(function(err, ary){
		if (err) throw err;
		res.send(ary);
	});
}
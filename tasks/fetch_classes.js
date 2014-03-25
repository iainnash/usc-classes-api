var MongoClient = require('mongodb').MongoClient;
var http = require('http'),
    url = require('url'),
    sys = require('sys');

var TERM = '20141'
var API_BASE = 'http://web-app.usc.edu/ws/soc/api/'
var API_BASE_URL = url.parse(API_BASE);

function do_get_classes(middle, cb){
	var options = {
		hostname: API_BASE_URL.hostname,
		port: API_BASE_URL.port,
		path: API_BASE_URL.path + '/'+middle+'/' + TERM,
		method: 'GET'
	};
	console.log('GETTING ' + middle + ' @ USC API');
	var req = http.request(options, function(res){
		res.setEncoding('utf8');
		var out = '';
		res.on('data', function(chunk){
			out += chunk;
		})
		res.on('end', function(){
			try {
				cb(null, JSON.parse(out));
			} catch (e){
				cb(e, null);
			}
		})
	})
	req.on('error', function(err){
		cb(err, null);
	})
	// fires erquest
	req.end();
}

MongoClient.connect('mongodb://127.0.0.1:27017/uscclasses', function(err, db){
	if (err) throw err;

	if (process.argv[2] == 'dept'){

		var process_department = function(json){
			db.collection('departments').update({code: json.code}, {code: json.code, name: json.name, type: json.type}, 
				{upsert: true}, function(err, info){
				if (typeof json.department != 'array') return;
				json.department.forEach(function(dept){
					dept.parent = json.code;
					dept.parent_id = id;
					process_department(dept);
					console.log('inserting department ' + dept);
				});
			});
		}

		do_get_classes('departments', function(err, json){
			if (err) throw err;
			console.log(json.department);
			json.department.forEach(function(dept){
				process_department(dept);
			})
		});

	} else if (process.argv[2] == 'class'){

		var process_classes = function(json){
			json.uscid = json.PublishedCourseID;
			Object.keys(json.CourseData).forEach(function(key){
				json[key] = json.CourseData[key];
			});
			json.CourseData = null;
			db.collection('classes').update({uscid: json.uscid}, json, {upsert: true}, function(err, info){
				if (err) throw err;
				// :)
			});
		}

		db.collection('departments').find({}).each(function(err, dept){
			if (err) throw err;
			console.log(dept);
			if (dept == null) return;
			do_get_classes('classes/' + dept.code, function(err, data){
				if (err) throw err;
				try {
					data['OfferedCourses']['course'].forEach(function(course){
						process_classes(course);
					});
				} catch(e){
					console.log(e);
					console.log(data);
				}
			})
		})
		

	} else {
		console.log('no command!');
	}



});

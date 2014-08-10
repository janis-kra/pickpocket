var https = require('https');

module.exports.obtainRequestToken = function (callback) {

	var authenticate = {
		consumer_key : '30843-dc2a59fc91f1549e81c9101d',
		redirect_uri : 'http://janis-kra.github.io/Pickpocket'
	};

	var authenticationStr = JSON.stringify(authenticate);

	var header = {
		'Content-Type' : 'application/json, charset=UTF8',
		'Content-Length' : authenticationStr.length,
		'X-Accept' : 'application/json'
	};

	var options = {
		hostname: 'getpocket.com',
		port: 443,
		path: '/v3/oauth/request',
		method: 'POST',
		headers : header
	};

	console.log('requesting...');
	var req = https.request(options, function(res) {

		res.setEncoding('utf-8');

		res.on('data', function(d) {
			callback(null, JSON.parse(d).code);
		});
	});

	req.write(authenticationStr);
	req.end();

	req.on('error', function(e) {
		callback(e);
	});
}

var https = require('https');


/**
 * Calls the Pocket API via HTTPS to obtain a request token that 
 * is used for every subsequent call to the Pocket API.
 *
 * @param {Function} callback: The function to be called upon
 * completion of the request. Should conform the the syntax
 * function(error, data).
 */
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

	var req = https.request(options, function(res) {

		res.setEncoding('utf-8');

		res.on('data', function(d) {
			var data = JSON.parse(d);
			data.redirectUri = authenticate.redirect_uri;
			callback(null, data);
		});
	});

	req.write(authenticationStr);
	req.end();

	req.on('error', function(e) {
		callback(e);
	});
}


/**
 * Build a URL that can be called to authorize the application on the pocket
 * website.
 *
 * @param {String} requestToken: The request token that was requested 
 * using obtainRequestToken.
 * @param {String} redirectUri: The URL that the user will be redirected 
 * to after the authorization was completed.
 * @param {Function} callback: The function to be called upon completion 
 * of the request. Should conform the the syntax function(error, data).
 */
module.exports.getAuthorizationURL = 
	function (requestToken, redirectUri, callback) {

	if (requestToken.isEmpty() || redirectUri.isEmpty()) {
		callback('invalid params:\n'
		 + requestToken 
		 + '\n' 
		 + redirectUri);
	} else {
		callback(null, 'https://getpocket.com/auth/authorize?request_token='
			+ requestToken
			+ '&redirect_uri='
			+ redirectUri);
	}
};


// --------------------
// Some utility functions for making the code easier to read
// --------------------

String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};

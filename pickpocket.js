var pickpocket = require('./pickpocket_api'),
	open = require('open');

var options = [];

var onReceiveToken = function (error, data) {
	if (error) {
		console.log(error);
	} else {
		var requestToken = data.code;
		var redirectUri = data.redirectUri;
		var authorizeUrl = pickpocket.getAuthorizationURL(requestToken, redirectUri, function (e, data) {
			if (e) {
				console.log(e);
			} else {
				open(data);
			}
		});
	}
};

var deletionThreshold = argv.process[2];

if (!isNan(deletionThreshold)) {
	options[0] = deletionThreshold;

	pickpocket.obtainRequestToken(onReceiveToken);
	pickpocket.startService(options);
} else {
	console.log("Usage: node pickpocket.js deletion-threshold");
}

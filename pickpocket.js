var pickpocket = require('./pickpocket_api'),
	open = require('open');

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

pickpocket.obtainRequestToken(onReceiveToken);

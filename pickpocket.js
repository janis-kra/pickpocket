var pickpocket = require('./pickpocket_api');

pickpocket.obtainRequestToken(function (error, data) {
	if (error) {
		console.log(error);
	} else {
		var requestToken = data.code;
		var redirectUri = data.redirectUri;
		pickpocket.authorize(requestToken, redirectUri);
	}
});
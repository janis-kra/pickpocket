var pickpocket = require('./pickpocket_api');

pickpocket.obtainRequestToken(function (error, data) {
	if (error) {
		console.log(error);
	} else {
		console.log(data);
	}
});

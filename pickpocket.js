const https = require('https');

module.exports = ({ consumerKey = '' }) => {
  const obtainRequestToken = function obtainRequestToken (callback) {
    const authenticate = {
      consumer_key: consumerKey,
      redirect_uri: 'http://janis-kra.github.io/Pickpocket'
    };

    const authenticationStr = JSON.stringify(authenticate);

    const header = {
      'Content-Type': 'application/json, charset=UTF8',
      'Content-Length': authenticationStr.length,
      'X-Accept': 'application/json'
    };

    const options = {
      hostname: 'getpocket.com',
      port: 443,
      path: '/v3/oauth/request',
      method: 'POST',
      headers: header
    };

    const req = https.request(options, (res) => {
      res.setEncoding('utf-8');

      res.on('data', (d) => {
        const data = JSON.parse(d);
        data.redirectUri = authenticate.redirect_uri;
        callback(null, data);
      });
    });

    req.write(authenticationStr);
    req.end();

    req.on('error', (e) => {
      callback(e);
    });
  };

  const authorize = function authorize (requestToken, redirectUri, callback) {
    if (requestToken.isEmpty() || redirectUri.isEmpty()) {
      callback('invalid params:\n' +
        requestToken +
        '\n' + redirectUri);
    } else {
      callback(null, 'https://getpocket.com/auth/authorize?request_token=' +
        requestToken +
        '&redirect_uri=' +
        redirectUri);
    }
  };

  return {
    authorize: authorize,
    obtainRequestToken: obtainRequestToken
  };
};

// --------------------
// Some utility functions for making the code easier to read
// --------------------

String.prototype.isEmpty = function () {
  return (this.length === 0 || !this.trim());
};

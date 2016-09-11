const GetPocket = require('node-getpocket');

const createObtainRequestToken = function createObtainRequestToken (consumer = '') {
  /**
   * Gets a request token from the getpocket webservice endpoint
   * @return {Promise} a promise that either resolves with the token string, or
   * rejects with an error message
   */
  return function obtainRequestToken ({
    consumerKey = consumer
  } = {}) {
    return new Promise((resolve, reject) => {
      if (consumerKey === '') {
        reject('no consumer key given');
      }
      const config = {
        consumer_key: consumerKey,
        redirect_uri: 'http://janis-kra.github.io/Pickpocket'
      };
      const pocket = new GetPocket(config);
      pocket.getRequestToken(
        { redirect_uri: config.redirect_uri },
        (err, resp, body) => {
          if (err) {
            reject(`Oops; getTokenRequest failed: ${err}`);
          } else {
            const json = JSON.parse(body);
            const requestToken = config.request_token = json.code;
            resolve(requestToken);
          }
        }
      );
    });
  };
};

const createGetAuthorizeURL = function createGetAuthorizeURL (consumer = '') {
  /**
   * Builds a URL that can be used to authorize the application with the
   * getpocket service.
   * @param  {string}   requestToken the request token that was obtained, e.g.
   * via getRequestToken (may be omitted if getRequestToken was called earlier)
   * @return {Promise} a promise that either resolves with the authorization
   * url, or rejects with an error message
   */
  return function authorize ({
    requestToken = '',
    consumerKey = consumer
  } = {}) {
    return new Promise((resolve, reject) => {
      if (requestToken === '') {
        reject('no request token given - obtain one by calling obtainRequestToken');
      }
      if (consumerKey === '') {
        reject('no consumer key given');
      }
      const config = {
        consumer_key: consumerKey,
        redirect_uri: 'http://janis-kra.github.io/Pickpocket'
      };
      const pocket = new GetPocket(config);
      const url = pocket.getAuthorizeURL({
        consumer_key: consumerKey,
        request_token: requestToken || config.request_token,
        redirect_uri: 'http://janis-kra.github.io/Pickpocket'
      });
      resolve(url);
    });
  };
};

module.exports = ({
  consumerKey = '',
  log = console.log
} = {}) => {
  if (consumerKey === '') {
    log('no consumer key given, remember to pass it as an argument to each api call');
  }

  return {
    getAuthorizeURL: createGetAuthorizeURL(consumerKey),
    obtainRequestToken: createObtainRequestToken(consumerKey)
  };
};

const GetPocket = require('node-getpocket');

const REDIRECT_URI = 'http://janis-kra.github.io/Pickpocket';
const ERR_MODULE_NOT_INITIALIZED = 'module not initialized correctly ' +
  '(pass your consumer key as a parameter)';
const ERR_NO_REQUEST_TOKEN = 'no (valid) request token given - get one ' +
  'by calling obtainRequestToken';

const createObtainRequestToken = function createObtainRequestToken (getpocket = {}) {
  /**
   * Gets a request token from the getpocket webservice endpoint
   * @return {Promise} a promise that either resolves with the token string, or
   * rejects with an error message
   */
  return function obtainRequestToken () {
    // FIXME Promise { <pending> }
    return new Promise((resolve, reject) => {
      if (getpocket === {}) {
        reject(ERR_MODULE_NOT_INITIALIZED);
      }
      getpocket.getRequestToken(
        { redirect_uri: REDIRECT_URI },
        (err, resp, body) => {
          if (err) {
            reject(`getTokenRequest failed: ${err}`);
          } else {
            const json = JSON.parse(body);
            const requestToken = json.code;
            resolve(requestToken);
          }
        }
      );
    });
  };
};

const createGetAuthorizeURL = function createGetAuthorizeURL (getpocket = {}) {
  /**
   * Builds a URL that can be used to authorize the application with the
   * getpocket service.
   * @return {string} the url that can be used to authorize the application
   */
  return function getAuthorizationURL ({ requestToken = '' } = {}) {
    if (getpocket === {}) {
      throw new Error(ERR_MODULE_NOT_INITIALIZED);
    }
    if (typeof requestToken !== 'string' || requestToken === '') {
      throw new Error(ERR_NO_REQUEST_TOKEN);
    }
    return getpocket.getAuthorizeURL({
      consumer_key: getpocket.config.consumer_key,
      request_token: requestToken
    });
  };
};

const createObtainAccessToken = function createObtainAccessToken (getpocket = {}) {
  return function obtainAccessToken ({ requestToken = '' } = {}) {
    return new Promise((resolve, reject) => {
      if (typeof requestToken !== 'string' || requestToken === '') {
        throw new Error(ERR_NO_REQUEST_TOKEN);
      }
      const params = {
        request_token: requestToken
      };
      getpocket.getAccessToken(params, (err, resp, body) => {
        if (err) {
          reject(`Oops; getTokenRequest failed: ${err}`);
        } else {
        // your access token is in body.access_token
          const json = JSON.parse(body);
          const accessToken = json.access_token;
          resolve(accessToken);
        }
      });
    });
  };
};

module.exports = ({
  consumerKey = '',
  log = console.log
} = {}) => {
  if (typeof consumerKey !== 'string' || consumerKey === '') {
    throw new Error('no consumer key given, remember to pass it as an argument to each api call');
  }

  const config = {
    consumer_key: consumerKey,
    redirect_uri: REDIRECT_URI
  };
  const getpocket = new GetPocket(config);
  log(`Module successfully initialized using consumer key ${consumerKey}`);

  return {
    getAuthorizationURL: createGetAuthorizeURL(getpocket),
    obtainAccessToken: createObtainAccessToken(getpocket),
    obtainRequestToken: createObtainRequestToken(getpocket)
  };
};

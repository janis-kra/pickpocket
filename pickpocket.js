// TODO Add flow?
const GetPocket = require('node-getpocket');
const articles = require('./articles');
const values = require('lodash.values');

const REDIRECT_URI = 'http://janis-kra.github.io/Pickpocket';
const ERR_MODULE_NOT_INITIALIZED = 'module not initialized correctly ' +
  '(pass your consumer key as a parameter)';
const ERR_NO_REQUEST_TOKEN = 'no (valid) request token given - get one ' +
  'by calling obtainRequestToken';

const createGetAllArticles = function createGetAllArticles (getpocket = {}, options = {}) {
  return function getAllArticles () {
    return new Promise((resolve, reject) => {
      getpocket.get(Object.assign({}, {
        detailType: 'simple'
      }, options), (err, res) => {
        if (err) {
          reject(new Error(err));
        }
        resolve(res);
      });
    });
  };
};

const createGetOverdueArticles = function createGetOverdueArticles (getpocket = {}) {
  return function getOverdueArticles ({
    includeFavorites = true,
    maxMonths = 6
  } = {}) {
    const getArticles = createGetAllArticles(getpocket, {
      includeFavorites: includeFavorites,
      sort: 'oldest',
      state: 'unread'
    });
    return getArticles().then((a) => {
      const deletionThreshold = new Date();
      deletionThreshold.setMonth(deletionThreshold.getMonth() - maxMonths);
      return articles.filter(values(a.list), {
        includeFavorites: includeFavorites,
        from: deletionThreshold
      });
    });
  };
};

const createArchiveOverdueArticles = function createArchiveOverdueArticles (
  getpocket = {}, log = console.log) {
  return function archiveOverdueArticles ({
    includeFavorites = true,
    maxMonths = 6
  } = {}) {
    const getOverdueArticles = createGetOverdueArticles(getpocket, {
      includeFavorites: includeFavorites,
      maxMonths: maxMonths
    });
    getOverdueArticles().then((overdueArticles) => {
      log('archiving: ');
      for (const article of overdueArticles) {
        getpocket.archive({ item_id: article.item_id }, (err) => {
          if (err) {
            log(`unable to archive ${article.item_id}`);
          }
          log(JSON.stringify(article));
        });
      }
    });
  };
};

const createObtainRequestToken = function createObtainRequestToken (getpocket = {}) {
  /**
   * Gets a request token from the getpocket webservice endpoint
   * @return {Promise} a promise that either resolves with the token string, or
   * rejects with an error message
   */
  return function obtainRequestToken () {
    return new Promise((resolve, reject) => {
      if (getpocket === {}) {
        reject(new Error(ERR_MODULE_NOT_INITIALIZED));
      }
      getpocket.getRequestToken(
        { redirect_uri: REDIRECT_URI },
        (err, resp, body) => {
          if (err) {
            reject(new Error(err));
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
      request_token: requestToken,
      redirect_uri: REDIRECT_URI
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
          reject(new Error(err));
        } else if (!body.startsWith('{')) {
          reject(new Error(ERR_NO_REQUEST_TOKEN));
        } else {
          const json = JSON.parse(body);
          const accessToken = json.access_token;
          getpocket.refreshConfig(Object.assign(
            {},
            getpocket.config,
            { access_token: accessToken }
          ));
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
    getAllArticles: createGetAllArticles(getpocket),
    getOverdueArticles: createGetOverdueArticles(getpocket),
    getAuthorizationURL: createGetAuthorizeURL(getpocket),
    archiveOverdueArticles: createArchiveOverdueArticles(getpocket, log),
    obtainAccessToken: createObtainAccessToken(getpocket),
    obtainRequestToken: createObtainRequestToken(getpocket),
    setAccessToken: (token) => getpocket.refreshConfig(Object.assign(
      {},
      getpocket.config,
      { access_token: token }
    ))
  };
};

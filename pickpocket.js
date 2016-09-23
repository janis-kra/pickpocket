/* @flow weak */
const GetPocket = require('node-getpocket');
const articles = require('./articles');
const values = require('lodash.values');

const PICKPOCKET_CONSUMER_KEY = '30843-dc2a59fc91f1549e81c9101d';
const REDIRECT_URI = 'http://janis-kra.github.io/Pickpocket';
const ERR_MODULE_NOT_INITIALIZED = 'module not initialized correctly ' +
  '(pass your consumer key as a parameter)';
const ERR_NO_REQUEST_TOKEN = 'no (valid) request token given - get one ' +
  'by calling obtainRequestToken';

const pocket = (config) => new GetPocket(config);

const createConfig = (options) => Object.assign(
  {},
  { consumer_key: PICKPOCKET_CONSUMER_KEY, redirect_uri: REDIRECT_URI },
  options
);

const getAllArticles = function getAllArticles ({
  token = ''
} = {}) {
  return new Promise((resolve, reject) => {
    GetPocket.get({
      detailType: 'simple',
      access_token: token
    }, (err, res) => {
      if (err) {
        reject(new Error(err));
      }
      resolve(res);
    });
  });
};
// TODO: Continue purifying all the functions
const createGetOverdueArticles = function createGetOverdueArticles (getpocket = {}) {
  return function getOverdueArticles ({
    includeFavorites = false,
    maxMonths = 6
  } = {}) {
    const getArticles = createGetAllArticles(getpocket, {
      favorite: includeFavorites,
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

const createAddArchivedTag = function createAddArchivedTag (getpocket = {}) {
  return function addArchivedTag (items = []) {
    const params = {
      actions: items.map(item => ({
        action: 'tags_add',
        item_id: item.item_id
      }))
    };
    return new Promise((resolve, reject) => {
      getpocket.send(params, (err, res) => {
        if (res) {
          resolve(true);
        }
        reject(err);
      });
    });
  };
};

const createArchiveOverdueArticles = function createArchiveOverdueArticles (
  getpocket = {}, log = console.log, toggle = {}) {
  return function archiveOverdueArticles ({
    includeFavorites = false,
    maxMonths = 6
  } = {}) {
    // TODO: Return the archived articels' array to the caller!
    const getOverdueArticles = createGetOverdueArticles(getpocket, {
      includeFavorites: includeFavorites,
      maxMonths: maxMonths
    });
    const addArchivedTag = createAddArchivedTag(getpocket);
    getOverdueArticles().then((overdueArticles) => {
      log('archiving...');
      for (const article of overdueArticles) {
        if (toggle.archive) {
          getpocket.archive({ item_id: article.item_id }, (err) => {
            if (err) {
              log(`unable to archive ${article.item_id}`);
            }
            log(JSON.stringify(article.given_url));
          });
        } else {
          log(JSON.stringify(article));
        }
      }
      log('finished');
    }).then(() => addArchivedTag());
  };
};

/**
 * Gets a request token from the getpocket webservice endpoint
 * @param options {object} an alternative consumer key
 * @return {Promise} a promise that either resolves with the token string, or
 * rejects with an error message
 */
const obtainRequestToken = function obtainRequestToken (
  { consumerKey = PICKPOCKET_CONSUMER_KEY } = {}
) {
  return new Promise((resolve, reject) => {
    const config = createConfig({ consumer_key: consumerKey });
    pocket(config).getRequestToken(config, (err, resp, body) => {
      if (err) {
        reject(new Error(err));
      } else {
        const json = JSON.parse(body);
        const requestToken = json.code;
        resolve(requestToken);
      }
    });
  });
};

  /**
   * Builds a URL that can be used to authorize the application with the
   * getpocket service.
   * @param options {object} an alternative consumer key
   * @return {string} the url that can be used to authorize the application
   */
const getAuthorizationURL = function getAuthorizationURL ({ requestToken = '' } = {}) {
  if (typeof requestToken !== 'string' || requestToken === '') {
    throw new Error(ERR_NO_REQUEST_TOKEN);
  }
  return pocket().getAuthorizationURL(createConfig({ request_token: requestToken }));
};

/**
 * Gets an access token from the getpocket webservice endpoint, given a request token that was
 * previously confirmed by the user.
 * @param options {object} the request token (required) and an alternative consumer key
 * @return {Promise} a promise that either resolves with the token string, or
 * rejects with an error message
 */
const obtainAccessToken = function obtainAccessToken ({
  consumerKey = PICKPOCKET_CONSUMER_KEY,
  requestToken = ''
} = {}) {
  return new Promise((resolve, reject) => {
    if (typeof requestToken !== 'string' || requestToken === '') {
      throw new Error(ERR_NO_REQUEST_TOKEN);
    }
    const options = createConfig({
      consumer_key: consumerKey,
      request_token: requestToken
    });
    pocket(options).getAccessToken(options, (err, resp, body) => {
      if (err) {
        reject(new Error(err));
      } else if (!body.startsWith('{')) {
        reject(new Error(ERR_NO_REQUEST_TOKEN));
      } else {
        const json = JSON.parse(body);
        const accessToken = json.access_token;
        resolve(accessToken);
      }
    });
  });
};

module.exports = ({
  consumerKey = '30843-dc2a59fc91f1549e81c9101d',
  log = console.log
} = {}) => {
  if (typeof consumerKey !== 'string' || consumerKey === '') {
    throw new Error('invalid consumerKey given');
  }

  const config = {
    consumer_key: consumerKey,
    redirect_uri: REDIRECT_URI
  };
  const getpocket = new GetPocket(config);
  // TODO: Use stampit for ths?
  return {
    getAllArticles: createGetAllArticles(getpocket),
    getOverdueArticles: createGetOverdueArticles(getpocket),
    getAuthorizationURL: getAuthorizationURL,
    archiveOverdueArticles: createArchiveOverdueArticles(getpocket, log, { archive: true }),
    obtainAccessToken: obtainAccessToken,
    obtainRequestToken: obtainAccessToken,
    setAccessToken: (token) => getpocket.refreshConfig(Object.assign(
      {},
      getpocket.config,
      { access_token: token }
    ))
  };
};

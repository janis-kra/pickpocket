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

/**
 * Get all articles that comply with the given filtering options. The articles will by default only
 * return the 'simple' details of the articles, but this can be overridden by setting
 * options.detailType='complete'
 * @param {string=''} token the access token that is used for accessing the pocket account
 * @param {Object={}} options additional options for filtering the articles
 */
const getAllArticles = function getAllArticles (
  token = '',
  options = {}
) {
  return new Promise((resolve, reject) => {
    const config = createConfig({ access_token: token });
    const params = Object.assign({
      detailType: 'simple',
      access_token: token
    }, options);
    pocket(config).get(params, (err, res) => {
      if (err) {
        reject(new Error(err));
      }
      resolve(res);
    });
  });
};

/**
 * Get all the overdue articles for the account identified by the given token.
 * Whether an article is considered 'overdue' is determined by the `maxMonth` parameter.
 * @param {string=''} token the access token that is used for accessing the pocket account
 * @param {Object={}} options options regarding the filtering of the articles
 * @param {boolean=false} options.includeFavorites whether to include favorited articles
 * in the list or not
 * @param {number=6} options.maxMonths the maximum age in months that an article can have
 * before it is considered overdue
 */
const getOverdueArticles = function getOverdueArticles (token = '', {
  includeFavorites = false,
  maxMonths = 6
} = {}) {
  const options = {
    favorite: includeFavorites,
    sort: 'oldest',
    state: 'unread'
  };
  return getAllArticles({ token: token }, options).then((a) => {
    const deletionThreshold = new Date();
    deletionThreshold.setMonth(deletionThreshold.getMonth() - maxMonths);
    return articles.filter(values(a.list), {
      includeFavorites: includeFavorites,
      from: deletionThreshold
    });
  });
};

/**
 * Add the 'archived by pickpocket' tag to the given articles.
 * @param {string=''} token the access token that is used for accessing the pocket account
 * @param {items=[]} items an array of items that should get the 'archived by pickpocket' tag
 */
const addArchivedTag = function addArchivedTag (token = '', items = []) {
  const params = {
    actions: items.map(item => ({
      action: 'tags_add',
      item_id: item.item_id
    }))
  };
  return new Promise((resolve, reject) => {
    const config = createConfig({ access_token: token });
    pocket(config).send(params, (err, res) => {
      if (res) {
        resolve(true);
      }
      reject(err);
    });
  });
};

/**
 * Archive all the overdue articles for the account identified by the given token.
 * Whether an article is considered 'overdue' is determined by the `maxMonth` parameter.
 * @param {string=''} token the access token that is used for accessing the pocket account
 * @param {Object={}} options options regarding the filtering of the articles
 * @param {boolean=false} options.includeFavorites whether to include favorited articles
 * in the list or not
 * @param {number=6} options.maxMonths the maximum age in months that an article can have
 * before it is considered overdue
 */
const archiveOverdueArticles = function archiveOverdueArticles (token = '', {
    includeFavorites = false,
    maxMonths = 6
  } = {}) {
  const archivedArticles = [];
  getOverdueArticles({
    includeFavorites: includeFavorites,
    maxMonths: maxMonths
  }).then((overdueArticles) => {
    const config = createConfig({ access_token: token });
    const p = pocket(config);
    for (const article of overdueArticles) {
      p.archive({ item_id: article.item_id }, (err) => {
        if (!err) {
          archivedArticles.push(article);
        }
      });
    }
  }).then(() => addArchivedTag(token, archivedArticles));
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
  return pocket().getAuthorizeURL(createConfig({ request_token: requestToken }));
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

module.exports = {
  getAllArticles: getAllArticles,
  getOverdueArticles: getOverdueArticles,
  getAuthorizationURL: getAuthorizationURL,
  archiveOverdueArticles: archiveOverdueArticles,
  obtainAccessToken: obtainAccessToken,
  obtainRequestToken: obtainRequestToken
};

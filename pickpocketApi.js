const p = require('./pickpocket');

module.exports = {
  archive: (token = '', options = {}) => {
    if (typeof token !== 'string' || token === '') {
      throw new Error('please input a valid access token');
    }
    return p.archiveOverdueArticles(token, options);
  },
  authorize: () => p.obtainRequestToken().then(t => ({
    token: t,
    url: p.getAuthorizationURL({ requestToken: t })
  }))
};

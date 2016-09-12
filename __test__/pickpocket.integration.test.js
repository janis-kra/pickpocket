/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const test = require('ava').test;
const pickpocket = require('../pickpocket');

const p = pickpocket({
  consumerKey: process.env.CONSUMER_KEY
});

test('output of getAuthorizationURL with valid request token',
  async t => p.obtainRequestToken().then((token) => {
    const url = p.getAuthorizationURL({ requestToken: token });
    t.truthy(url.startsWith('http'),
      'valid call to getAuthorizationURL returns a url');
  })
);

test('output of obtainAccessToken with unauthorized request token',
  async t => t.throws(
    p.obtainAccessToken({ requestToken: 'unauthorized_token' }),
    Error,
    'obtainAccessToken should throw a SyntaxError when called with an invalid request token'
  )
);

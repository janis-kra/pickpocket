/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const test = require('ava').test;
const pickpocket = require('./pickpocket');

const p = pickpocket({
  consumerKey: process.env.CONSUMER_KEY
});

test('instantiating the module without parameters', async t =>
  t.throws(() => pickpocket(), Error,
    'module creation wihtout parameters should throw an error')
);

test('instantiating the module with invalid parameter type boolean', async t =>
  t.throws(() => pickpocket({ consumerKey: true }), Error,
    'module creation wihtout parameters should throw an error')
);

test('output of obtainRequestToken', async t =>
  p.obtainRequestToken().then((token) => {
    t.is(typeof token, 'string', 'valid call to obtainRequestToken resolves with a string');
  })
);

test('output of getAuthorizationURL with invalid request token',
  async t => t.throws(() => p.getAuthorizationURL({ requestToken: true }), Error,
      'getAuthorizationURL should throw an error when called with an invalid request token')
);

test('output of getAuthorizationURL without request token',
  async t => t.throws(() => p.getAuthorizationURL(), Error,
      'getAuthorizationURL should throw an error when called without a request token')
);

test('output of getAuthorizationURL with valid request token',
  async t => p.obtainRequestToken().then((token) => {
    const url = p.getAuthorizationURL({ requestToken: token });
    t.truthy(url.startsWith('http'),
      'valid call to getAuthorizationURL returns a url');
  })
);

test('output of obtainAccessToken with invalid request token',
  async t => t.throws(p.obtainAccessToken({ requestToken: true }), Error,
      'obtainAccessToken should throw an error when called with an invalid request token')
);

test('output of obtainAccessToken without request token',
  async t => t.throws(p.obtainAccessToken(), Error,
      'obtainAccessToken should throw an error when called without a request token')
);

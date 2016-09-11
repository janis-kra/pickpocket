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

test('output of obtainRequestToken with valid consumer key', t =>
  p.obtainRequestToken().then((token) => {
    t.is(typeof token, 'string', 'valid call to obtainRequestToken resolves with a string');
  })
);

test('output of getAuthorizationURL with valid consumer key and request token',
  t => p.obtainRequestToken().then((token) => {
    const url = p.getAuthorizationURL({ requestToken: token });
    t.truthy(url.startsWith('http'),
      'valid call to getAuthorizationURL returns a url');
  })
);

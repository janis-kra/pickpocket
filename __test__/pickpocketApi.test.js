/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const test = require('ava').test;
const pickpocket = require('../pickpocket');

const p = pickpocket({
  consumerKey: process.env.CONSUMER_KEY
});

test('calling archive without access token', async t =>
  t.throws(p.archive(), Error,
    'calling archive without an access token should result in an error')
);

test('authorize', async t =>
  p.authorize().then((auth) => {
    t.truthy(auth.token, 'should return a request token');
    t.truthy(auth.url, 'should return an authorization url');
  })
);

/* eslint-disable import/no-extraneous-dependencies */
const articles = require('../articles');
const isGeneratorFn = require('is-generator').fn;
const test = require('ava').test;
const values = require('lodash.values');

const MOCK_DATA = values(JSON.parse(`{
  "46524476": {
    "item_id":"46524476","resolved_id":"46524476","given_url":"http://www.artofmanliness.com/2010/09/07/never-let-the-sun-catch-you-sleeping-why-and-how-to-become-an-early-riser/","given_title":"How to Become an Early Riser and the Benefits of Early Rising | The Art of ","favorite":"0","status":"0","time_added":"1465029924","time_updated":"1465029925","time_read":"0","time_favorited":"0","sort_id":162,"resolved_title":"Never Let the Sun Catch You Sleeping: Why and How to Become an Early Riser","resolved_url":"http://www.artofmanliness.com/2010/09/07/never-let-the-sun-catch-you-sleeping-why-and-how-to-become-an-early-riser/","excerpt":"...","is_article":"1","is_index":"0","has_video":"1","has_image":"1","word_count":"1736"
  },
  "1409914364": {
    "item_id":"1409914364","resolved_id":"1409914364","given_url":"https://www.rockpapershotgun.com/2016/09/11/the-sunday-papers-419/","given_title":"The Sunday Papers","favorite":"0","status":"0","time_added":"1473624667","time_updated":"1473624667","time_read":"0","time_favorited":"0","sort_id":277,"resolved_title":"The Sunday Papers","resolved_url":"https://www.rockpapershotgun.com/2016/09/11/the-sunday-papers-419/","excerpt":"...","is_article":"1","is_index":"0","has_video":"0","has_image":"1","word_count":"1214"
  }
}`));

test('filter function type', async t =>
  t.true(isGeneratorFn(articles.filter),
    'articles.filter should be a generator function')
);

test('filter without any parameters', async t =>
  t.throws(articles.filter().next, Error,
    'calling filter wihtout data should throw an error when the generator is run')
);

test('filter with empty data, without options', async t => {
  const filtered = articles.filter([]).next();
  return t.true(
    filtered.done && filtered.value === undefined,
    'calling filter with empty data should be done immediately (no values)'
  );
});

test('filter with empty data, with options', async t => {
  const filtered = articles.filter([], { from: Date.now() });
  const next = filtered.next();
  return t.true(
    next.done && next.value === undefined,
    'calling filter with empty data and some options should be done immediately (no values)'
  );
});

test('filter with mock data, without options', async t => {
  const filtered = articles.filter(MOCK_DATA);
  const actual = [filtered.next().value.item_id, filtered.next().value.item_id];
  const expected = ['46524476', '1409914364'];
  t.true(filtered.next().done, 'filter should be done here');
  return t.deepEqual(
    actual,
    expected,
    'calling filter without filter options should return the original article ids'
  );
});

test('filter with mock data, with options', async t => {
  const filtered = articles.filter(MOCK_DATA, { from: new Date(0) });
  const next = filtered.next();
  return t.true(
    next.done && next.value === undefined,
    'calling filter with mock data and the *from* option set to 1-1-1970 ' +
      'should return no elements at all'
  );
});

test('filter with mock data, with *from* option set to an items exact *time_added*', async t => {
  const filtered = articles.filter(MOCK_DATA, {
    from: new Date(1465029924 * 1000) // exact time of older article
  });
  const actual = [filtered.next().value.item_id];
  const expected = ['46524476'];
  const next = filtered.next();
  t.true(next.done && next.value === undefined, 'filter should be done here');
  return t.deepEqual(expected, actual, 'calling filter with *from* options set ' +
    'to an articles *time_added* should include this article in the results'
  );
});

test('filter with mock data, with *from* option set to an items *time_added* + 1', async t => {
  const filtered = articles.filter(MOCK_DATA, {
    from: new Date((1465029924 * 1000) + 1) // time of older article + 1 (i.e. a bit later)
  });
  const actual = [filtered.next().value.item_id];
  const expected = ['46524476'];
  const next = filtered.next();
  t.true(next.done && next.value === undefined, 'filter should be done here');
  return t.deepEqual(expected, actual, 'calling filter with *from* options set ' +
    'a tiny bit later than an articles *time_added* should NOT include this article in the results'
  );
});

/* @flow weak */
module.exports = {
  filter: function* filter (articles, {
    includeFavorites = true,
    from = Date.now()
  } = {}) {
    if (!Array.isArray(articles)) {
      throw new Error('*articles* array parameter must be present');
    }
    yield* articles.filter((a) => {
      const timeAdded = new Date(parseInt(a.time_added, 10) * 1000);
      const favorite = a.favorite === '1';
      return (timeAdded <= from) && (includeFavorites || !favorite);
    });
  }
};

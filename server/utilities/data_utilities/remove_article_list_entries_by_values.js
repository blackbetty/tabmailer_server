const _ = require('lodash');

// may remove too many at the moment
var dropOneMaxArticleEntryForUrlAndTitle = function(article_list, url, title) {
	_.remove(article_list, {
		article_url: url,
		article_title: title
	});
	console.log(article_list);
	return article_list;
}

module.exports = dropOneMaxArticleEntryForUrlAndTitle;
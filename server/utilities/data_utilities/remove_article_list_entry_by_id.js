const _ = require('lodash');

// may remove too many at the moment
var dropArticleForID = function (article_list, id) {
	_.remove(article_list, {
		article_id: id
	});
	// console.log(article_list);
	return article_list;
}

module.exports = dropArticleForID;
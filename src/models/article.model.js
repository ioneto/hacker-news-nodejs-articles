let mongoose = require('mongoose');

let ArticleSchema = new mongoose.Schema({
    title: String,
    url: String,
    author: String,
    points: Number,
    story_text: String,
    comment_text: String,
    _tags: [String],
    num_comments: Number,
    objectID: String,
    deleted: { type: Boolean, default: false },
    _highlightResult:
        {
            title:
                {
                    value: String,
                    matchLevel: String,
                    matchedWords: [String]
                },
            url:
                {
                    value: String,
                    matchLevel: String,
                    matchedWords: [String]
                },
            author:
                {
                    value: String,
                    matchLevel: String,
                    matchedWords: [String]
                }
        }
});

module.exports = mongoose.model('Article', ArticleSchema);
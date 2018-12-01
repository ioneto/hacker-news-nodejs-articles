let express = require('express');
let router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    let request = require("request");

    request.get("https://hn.algolia.com/api/v1/search_by_date?query=nodejs", (error, response, body) => {
        if(error) {
            return console.dir(error);
        }
        console.dir(JSON.parse(body));

        let articles = JSON.parse(body)['hits'];
        res.render('articles',{ articles: articles });
    });
});

module.exports = router;

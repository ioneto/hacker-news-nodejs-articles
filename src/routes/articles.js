let express = require('express');
let router = express.Router();
let app = express();
let MongoClient = require('mongodb').MongoClient;

const server = 'hacker-news-articles-m8qvj.gcp.mongodb.net';
const database = 'hacker-news-articles';
const user = 'default';
const password = '6Ah2pzb2oVid7Vyl';

router.get('/', function(req, res) {
    let request = require("request");

    request.get("https://hn.algolia.com/api/v1/search_by_date?query=nodejs", (error, response, body) => {
        if(error) {
            return console.dir(error);
        }

        console.log(`${new Date().toString()} => Connecting to database...`);
        let client = new MongoClient(`mongodb+srv://${user}:${password}@${server}`,{ useNewUrlParser: true });

        client.connect().then(() => {
            console.log(`${new Date().toString()} => Connected successfully to database server`);

            let db = client.db(database);

            let collection = db.collection('articles');

            collection.find({ deleted: false }).sort({created_at: -1}).limit(20).toArray(function(err, docs) {
                client.close();
                res.render('articles',{ articles: docs });
            });
        });
    });
});

router.post('/', function(req, res) {
    let objectID = req.body.objectID;
    console.log(`${new Date().toString()} => Connecting to database...`);
    let client = new MongoClient(`mongodb+srv://${user}:${password}@${server}`,{ useNewUrlParser: true });

    client.connect().then(() => {
        console.log(`${new Date().toString()} => Connected successfully to database server`);

        let db = client.db(database);

        let collection = db.collection('articles');

        console.log(`${new Date().toString()} =>  Deleting article with objectId = ${objectID}`);
        collection.updateOne({ objectID: objectID },{$set: {deleted: true} }).then(() => {
            collection.find({ deleted: false }).sort({created_at: -1}).limit(20).toArray(function(err, docs) {
                client.close();
                res.render('articles',{ articles: docs });
            });
        }, error => {
            console.log(error);
        });
    });
});

module.exports = router;

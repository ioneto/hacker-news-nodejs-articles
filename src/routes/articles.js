let express = require('express');
let router = express.Router();
let MongoClient = require('mongodb').MongoClient;
let credentials = require('../config/db.config');

/**
 * Method that displays the main view of the application (list of 20 most recent nodejs articles from hacker news)
 */
router.get('/', function(req, res) {
    console.log(`${new Date().toString()} => Connecting to database...`);
    let client = new MongoClient(`mongodb+srv://${credentials.user}:${credentials.password}@${credentials.server}`,{ useNewUrlParser: true });

    client.connect().then(() => {
        console.log(`${new Date().toString()} => Connected successfully to database server`);

        let db = client.db(credentials.database);

        let collection = db.collection('articles');

        collection.find({ deleted: false }).sort({created_at: -1}).limit(20).toArray(function(err, docs) {
            client.close();
            res.render('articles',{ articles: docs });
        });
    }, error => {
        console.error(`${new Date().toString()} =>  Database connection error`);
        console.error(error);
    });
});

/**
 * Method that deletes logically an article from the list. The article will being mark as deleted and it will not be displayed on the list anymore
 * Since the database doesn't delete documents physically, the articles list can, eventually, have more than 20 articles and continue showing the
 * most recent 20 articles
 *
 * After the deletion is completed, the application's main view is reloaded and the changes are displayed to the user
 */
router.post('/', function(req, res) {
    let objectID = req.body.objectID;
    console.log(`${new Date().toString()} => Connecting to database...`);
    let client = new MongoClient(`mongodb+srv://${credentials.user}:${credentials.password}@${credentials.server}`,{ useNewUrlParser: true });

    client.connect().then(() => {
        console.log(`${new Date().toString()} => Connected successfully to database server`);

        let db = client.db(credentials.database);

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
    }, error => {
        console.error(`${new Date().toString()} =>  Database connection error`);
        console.error(error);
    });
});

module.exports = router;

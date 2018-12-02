let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let moment = require('moment');
let request = require("request");
let bodyParser = require('body-parser');
let MongoClient = require('mongodb').MongoClient;
require('moment-timezone');

let articlesRouter = require('./routes/articles');
let credentials = require('./config/db.config');

let app = express();

app.locals.moment = moment;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', articlesRouter);

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/html/400.html'));
});

app.use((err, req, res) => {
    console.error(err.stack);
    res.sendFile(path.join(__dirname, '../public/html/500.html'));
});

/**
 * First API call at application startup
 *
 * The articles from the API are fetched and inserted in the database only if they are not registered previously (based on their objectID property)
 * Older articles on the database aren't deleted
 */
console.log(`${new Date().toString()} => Fetching data from API...`);
request.get("https://hn.algolia.com/api/v1/search_by_date?query=nodejs", (error, response, body) => {
    if(error) {
        return console.log(error);
    }
    let apiArticles = JSON.parse(body)["hits"];
    console.log(`${new Date().toString()} => Data fetched successfully`);
    console.log(`${new Date().toString()} => Connecting to database...`);
    const client = new MongoClient(`mongodb+srv://${credentials.user}:${credentials.password}@${credentials.server}`, {useNewUrlParser: true});
    client.connect().then(() => {
        console.log(`${new Date().toString()} => Connected successfully to database server`);

        const db = client.db(credentials.database);

        const collection = db.collection('articles');

        apiArticles.forEach((apiArticle) => {
            collection.find({objectID: apiArticle.objectID}).toArray(function(err, docs) {
                if(docs === null || docs.length === 0){
                    apiArticle.deleted = false;
                    collection.insertOne(apiArticle).then(() => {},error => {
                        console.error(`${new Date().toString()} => Error saving article from API to database`);
                        console.error(error);
                    });
                }
            });
        });
    }, error => {
        console.error(`${new Date().toString()} =>  Database connection error`);
        console.error(error);
    });
});

/**
 * Database update once an hour
 *
 * The articles from the API are fetched and inserted in the database only if they are not registered previously (based on their objectID property)
 * Older articles on the database aren't deleted
 */
setInterval(() => {
    console.log(`${new Date().toString()} => Fetching data from API...`);
    request.get("https://hn.algolia.com/api/v1/search_by_date?query=nodejs", (error, response, body) => {
        if(error) {
            return console.log(error);
        }
        let apiArticles = JSON.parse(body)["hits"];
        console.log(`${new Date().toString()} => Data fetched successfully`);
        console.log(`${new Date().toString()} => Connecting to database...`);
        const client = new MongoClient(`mongodb+srv://${user}:${password}@${server}`, {useNewUrlParser: true});
        client.connect().then(() => {
            console.log(`${new Date().toString()} => Connected successfully to database server`);

            const db = client.db(database);

            const collection = db.collection('articles');

            apiArticles.forEach((apiArticle) => {
                collection.find({objectID: apiArticle.objectID}).toArray(function(err, docs) {
                    if(docs === null || docs.length === 0){
                        apiArticle.deleted = false;
                        collection.insertOne(apiArticle).then(() => {},error => {
                            console.error(`${new Date().toString()} => Error saving article from API to database`);
                            console.error(error);
                        });
                    }
                });
            });
        }, error => {
            console.error(`${new Date().toString()} =>  Database connection error`);
            console.error(error);
        });
    });
}, 60*60*1000);

// MomentJS configuration for pretty date display and UTC timezone
moment.updateLocale('en', {
    calendar : {
        lastDay : '[Yesterday]',
        sameDay : 'hh:mm a',
        lastWeek : 'MMM DD',
    }
});

moment.locale('en');
moment.tz.setDefault('Europe/Lisbon');

module.exports = app;
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let moment = require('moment');
let request = require("request");
var bodyParser = require('body-parser')
let MongoClient = require('mongodb').MongoClient;
require('moment-timezone');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let articlesRouter = require('./routes/articles');

const server = 'hacker-news-articles-m8qvj.gcp.mongodb.net';
const database = 'hacker-news-articles';
const user = 'default';
const password = '6Ah2pzb2oVid7Vyl';

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

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/articles', articlesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

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
                    collection.insertOne(apiArticle);
                }
            });
        });
    });
});

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
                        collection.insertOne(apiArticle);
                    }
                });
            });
        });
    });
}, 60*60*1000);

//MomentJS configuration
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
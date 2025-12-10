const path = require('path')
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const session = require('express-session');
const RedisStore = require('connect-redis').RedisStore;
const redis = require('redis');
require('dotenv').config();

const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost/FortuneRoller';
mongoose.connect(dbURI).catch((err) => {
    if (err) {
        console.log('Could not connect to database');
        throw err;
    }
});


// console.log("Using DB:", process.env.MONGODB_URI);
// console.log("Using Redis:", process.env.REDISCLOUD_URL);

const redisClient = redis.createClient({
    url: process.env.REDISCLOUD_URL
});

redisClient.connect().then(() => {
    const app = express();

    app.use(helmet());
    app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted`)));
    app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
    app.use(compression());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(session({
        key: 'sessionid',
        store: new RedisStore({
            client: redisClient
        }),
        secret: 'Fate Sisters',
        resave: false,
        saveUninitialized: false
    }));

    //sets local user variable for handlebars
    app.use((req, res, next) => {
        res.locals.account = req.session.account;
        next();
    });


    app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
    app.set('view engine', 'handlebars');
    app.set('views', `${__dirname}/../views`);

    router(app);

    app.listen(port, (err) => {
        if (err) { throw err; }
        console.log(`Listening on port ${port}`);
    });

});
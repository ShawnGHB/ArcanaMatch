const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
    app.get('/getRolls', mid.requiresLogin, controllers.CardDeck.getRolls);

    app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
    app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

    app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

    app.get('/logout', mid.requiresLogin, controllers.Account.logout);
    app.get('/fortuna', mid.requiresLogin, controllers.CardDeck.gamblePage);
    app.post('/fortuna', mid.requiresLogin, controllers.CardDeck.rollDeck);

    app.get('/account', mid.requiresLogin, controllers.CardDeck.gamblePage);
    app.post('/fortuna', mid.requiresLogin, controllers.CardDeck.rollDeck);

    app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;

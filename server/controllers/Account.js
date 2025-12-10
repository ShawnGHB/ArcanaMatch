const models = require('../models');
const Account = models.Account;


const loginPage = (req, res) => {
    return res.render('login');
};

const logout = (req, res) => {
    req.session.destroy();
    return res.redirect('/');
};

const login = (req, res) => {
    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;

    if (!username || !pass) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    return Account.authenticate(username, pass, (err, account) => {
        if (err || !account) {
            return res.status(401).json({ error: 'Wrong username or password!' });
        }

        //sends the account session
        req.session.account = Account.toAPI(account);

        return res.json({ redirect: '/fortuna' });
    })
};

const signup = async (req, res) => {
    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;
    const pass2 = `${req.body.pass2}`;
    const birthday = `${req.body.birthday}`;

    if (!username || !pass || !pass2 || !birthday) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    if (pass !== pass2) {
        return res.status(400).json({ error: 'Passwords do not match!' });
    }

    try {
        const hash = await Account.generateHash(pass);
        const zodiacSign = await Account.zodiac(new Date(birthday));
        const newAccount = new Account({ username, password: hash, birthday, zodiac: zodiacSign });
        await newAccount.save();
        req.session.account = Account.toAPI(newAccount);
        return res.json({ redirect: '/fortuna' });
    } catch (err) {
        console.log(err);
        if (err.code === 110000) {
            return res.status(400).json({ error: 'Username already in use!' });
        }
        return res.status(500).json({ error: 'An error occured!' });
    }
};

const getName = async (req,res) => {
    try {
        const query = { owner: req.session.account._id };
        const docs = await Account.find(query).select('username').lean().exec();
    
        return res.json({ users: docs });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving Domos!' });
    }

};

module.exports = {
    loginPage,
    logout,
    login,
    signup,
    getName
};
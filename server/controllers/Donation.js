const makerPage = async (req, res) => {
    return res.render('app',
        {
            zodiac: req.session.account.zodiac,
            luck: req.session.account.luck,
        });
};
//main page
const models = require('../models');
const Tarot = models.Tarot;

const makeTarot = async (req, res) => {
    if (!req.body.name || !req.body.age) {
        return res.status(400).json({ error: 'Name and age are required!' });
    }

    const AccountData = {
        name: req.body.name,
        age: req.body.age,
        owner: req.session.account._id,
    };

    try {
        const newAccount = new Account(AccountData);
        await newAccount.save();
        return res.status(201).json({ name: newAccount.name, age: newAccount.age });
    } catch (err) {
        console.log(err);
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Account already exists!' });
        };

        return res.status(500).json({ error: 'An error occurred making Accounts.' });
    }
};

const getAccounts = async (req, res) => {
    try {
        const query = { owner: req.session.account._id };
        const docs = await Account.find(query).select('name age').lean().exec();

        return res.json({ Accounts: docs });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving Accounts!' });
    }

};

module.exports = {
    makerPage,
    makeTarot,
    getAccounts
};
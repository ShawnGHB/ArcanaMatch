const gamblePage = async (req, res) => {
    return res.render('app', {
        //need to render values so they're accessible from the session
        // username: req.session.account.username,
        // birthday: req.session.account.birthday,
        // zodiac: req.session.account.zodiac,
        zodiac: req.session.account.zodiac,
        score: req.session.account.score,
    });
};

const models = require('../models');
const Tarot = models.Tarot;
const Account = models.Account;


// request is going to take the bet and return a new score based off of the roll function
const grabTarots = async (req, res) => {
    try {
        const res = await fetch("https://tarotapi.dev/api/v1/cards/random?n=5");
        const data = await res.json();

        cardNames = data.cards.map((data) => data.name); //gives us cards names
        cardSuits = data.cards.map((data) => data.suitt);
        return { cardNames, cardSuits };
        // return the cards so rollDeck can use them
    } catch (err) {
        console.error(err);
        throw err;
    }
};

const rollDeck = async (req, res) => {
    if (!req.body.bet) {
        return res.status(400).json({ error: 'Enter a bet!' });
    }

    //insert function that rolls cards
    const cardRoll = await grabTarots();

    //bases the betChance off the suit of card (and zodiac)
    var betChance = 0;
    for (var i = 0; i < 5; i++) {

        if (["wands", "swords"].includes(cardRoll.cardSuits[i])) {
            betChance -= 1;
        } else {
            betChance += 1;
        }
    }

    const zodiac = req.session.account.zodiac;
    if (["Gemini", "Scorpio", "Sagittarius"].includes(zodiac)) {
        betChance += 1;
    } else if (["Pisces", "Libra", "Taurus"].includes(zodiac)) {
        betChance -= 1;
    }


    var win = false;
    if (betChance < 0) {
        win = false
    } else {
        win = true;
    }

    var bet = parseInt(req.body.bet);

    bet += win ? bet : -bet; // will add or decrease based on success of bet


const rollData = {
    luck: win,
    score: bet,
    cards: cardRoll.cardNames,
    owner: req.session.account._id,
};

const updateAccount = await Account.findByIdAndUpdate(
    req.session.account._id,
    { $inc: { score: bet } }, //inc updates numeric values
    { new: true }
);

try {
    const newRoll = new Tarot(rollData);
    await newRoll.save();
    return res.status(201).json({ luck: newRoll.luck, cards: newRoll.cards, score: newRoll.score });
} catch (err) {
    console.log(err);
    if (err.code === 11000) {
        return res.status(400).json({ error: 'Something went wrong!' });//roll shouldn't happen again
    };

    return res.status(500).json({ error: 'An error during your gamble.' });
}
};

const getRolls = async (req, res) => {
    try {
        const query = { owner: req.session.account._id };
        const docs = await Tarot.find(query).select('luck cards').lean().exec();

        return res.json({ rolls: docs });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving Rolls!' });
    }

};

module.exports = {
    gamblePage,
    rollDeck,
    getRolls,
};
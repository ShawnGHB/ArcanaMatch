
//account page
const bcrypt = require('bcrypt');
const models = require('../models');
const Tarot = models.Tarot;
const Account = models.Account;

const update = async (req, res) => {
    try {

        var newBirthday = req.session.account.birthday;
        var newZodiac = req.session.account.zodiac;
        //var birthdayMessage = "Birthday not updated";

        //will update birthday and zodiac sign at onces
        if (req.body.birthday) {
            newBirthday = req.body.birthday;
            newZodiac = await Account.zodiac(new Date(newBirthday));
            //birthdayMessage = "Birthday updated";
            req.session.account.birthday = newBirthday;
            req.session.account.zodiac = newZodiac;
        }

        const oldPass = req.body.pass;
        var newPass = req.body.pass2;

        //compares old string to hashed one
        // const isMatching = bcrypt.compareSync(oldPass, req.session.account.password);
        if (oldPass && newPass) {
            //reuse model authentitcate function
            return Account.authenticate(req.session.account.username, oldPass, async (err, account) => {
                if (err || !account) {
                    return res.status(401).json({ error: 'wrong pass' });
                }
                const hash = await Account.generateHash(newPass);


                const updatedAccount = await Account.findByIdAndUpdate(
                    req.session.account._id,
                    { password: hash, birthday: newBirthday, zodiac: newZodiac },
                    { new: true }
                )
                req.session.account.password = hash;
                req.session.save();

                return res.status(201).json({ updatedBirth: updatedAccount.birthday, updatedZodiac: updatedAccount.zodiac, updatedPass: updatedAccount.password });
            });
        } else {

            // if(isMatching) {
            //     // "setting the new pass"
            // }

            //don't update password if not matching since its hashed
            const updatedAccount = await Account.findByIdAndUpdate(
                req.session.account._id,
                { birthday: newBirthday, zodiac: newZodiac },
                { new: true }
            )
            //req.session.account.password = newPass;
            req.session.save();

            return res.status(201).json({ updatedBirth: updatedAccount.birthday, updatedZodiac: updatedAccount.zodiac });
        }
    } catch (err) {
        console.log(err);
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Account already exists!' });
        };

        return res.status(500).json({ error: 'An error occurred making Accounts.' });
    }
};

const donation = async (req, res) => {

    if (req.body.amount < 0) {
        return res.status(400).json({ error: "You can't take away from the user!" });
    }


    //remove from the account by amount given
    const updateDonator = await Account.findByIdAndUpdate(
        req.session.account._id,
        { $inc: { score: -parseInt(req.body.amount) } }, //inc updates numeric values
        { new: true }
    );

    //update the account of the user by amount given
    const updateAccount = await Account.findByIdAndUpdate(
        req.body.accountId,
        { $inc: { score: parseInt(req.body.amount) } }, //inc updates numeric values
        { new: true }
    );

    try {

        //save this updated account so the session can read it
        await updateAccount.save(); // already an account
        req.session.account.score = updateDonator.score;
        req.session.save();

        return res.status(201).json({ updateAccount: updateAccount.score, updateDonator: updateDonator });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving Accounts!' });
    }

};

const getAccounts = async (req, res) => {
    try {
        //no query cause we want all accounts
        //with time would add filter on Account to remove self
        //const query = { owner: req.session.account._id };
        const docs = await Account.find({}).select('username zodiac score birthday').lean().exec();

        return res.json({ accounts: docs });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving Accounts!' });
    }

};

module.exports = {
    update,
    getAccounts,
    donation
};
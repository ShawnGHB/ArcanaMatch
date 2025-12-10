/* This file defines our schema and model interface for the account data.

  We first import bcrypt and mongoose into the file. bcrypt is an industry
  standard tool for encrypting passwords. Mongoose is our tool for
  interacting with our mongo database.
*/
const bcrypt = require('bcrypt');
const e = require('express');
const mongoose = require('mongoose');

/* When generating a password hash, bcrypt (and most other password hash
  functions) use a "salt". The salt is simply extra data that gets hashed
  along with the password. The addition of the salt makes it more difficult
  for people to decrypt the passwords stored in our database. saltRounds
  essentially defines the number of times we will hash the password and salt.
*/
const saltRounds = 10;

let AccountModel = {};

/* Our schema defines the data we will store. A username (string of alphanumeric
  characters), a password (actually the hashed version of the password created
  by bcrypt), and the created date.
*/
const AccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  password: {
    type: String,
    required: true,
  },
  birthday: {
    type: String,
    required: true,
  },
  zodiac: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  score: { //will be 50 to start with
    type: Number,
    min: 0,
    default: 50,
  },
});


// Converts a doc to something we can store in redis later on.
AccountSchema.statics.toAPI = (doc) => ({
  username: doc.username,
  birthday: doc.birthday,
  zodiac: doc.zodiac,
  score: doc.score,
  _id: doc._id,
});

// Helper function to hash a password
AccountSchema.statics.generateHash = (password) => bcrypt.hash(password, saltRounds);

/* Helper function for authenticating a password against one already in the
  database. Essentially when a user logs in, we need to verify that the password
  they entered matches the one in the database. Since the database stores hashed
  passwords, we need to get the hash they have stored. We then pass the given password
  and hashed password to bcrypt's compare function. The compare function hashes the
  given password the same number of times as the stored password and compares the result.
*/
AccountSchema.statics.authenticate = async (username, password, callback) => {
  try {
    const doc = await AccountModel.findOne({ username }).exec();
    if (!doc) {
      return callback();
    }

    const match = await bcrypt.compare(password, doc.password);
    if (match) {
      return callback(null, doc);
    }
    return callback();
  } catch (err) {
    return callback(err);
  }
};

/*Helper Function to identify Zodiac*/
AccountSchema.statics.zodiac = async (birthday) => {

  const month = birthday.getUTCMonth() + 1; //indexes starting at 0 for some reason
  const day = birthday.getUTCDate();

  //Zodiac Date Ranges assigned based on birthday in user account
  if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) {
    return 'Aries';
  } else if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) {
    return 'Taurus';
  } else if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) {
    return 'Gemini';
  } else if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) {
    return 'Cancer';
  } else if ((month == 7 && day >= 21) || (month == 8 && day <= 22)) {
    return 'Leo';
  } else if ((month == 8 && day >= 21) || (month == 9 && day <= 22)) {
    return 'Virgo';
  } else if ((month == 9 && day >= 21) || (month == 10 && day <= 21)) {
    return 'Libra';
  } else if ((month == 10 && day >= 21) || (month == 11 && day <= 21)) {
    return 'Scorpio';
  } else if ((month == 11 && day >= 21) || (month == 12 && day <= 19)) {
    return 'Sagittarius';
  } else if ((month == 12 && day >= 21) || (month == 1 && day <= 18)) {
    return 'Capricorn';
  } else if ((month == 1 && day >= 21) || (month == 2 && day <= 19)) {
    return 'Aquarius';
  } else {
    return 'Pisces';
  }
};

AccountModel = mongoose.model('Account', AccountSchema);
module.exports = AccountModel;

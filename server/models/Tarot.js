const mongoose = require('mongoose');
const _ = require('underscore');


const TarotRollSchema = new mongoose.Schema({
    luck: {
        type: Boolean,
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    cards: {
        type: [String], // array for 5 cards
        validate: (arr) => arr.length == 5,
        required: true,
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account',
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
});

TarotRollSchema.statics.toAPI = (doc) => ({
    birth: doc.birth,
    score: doc.score,
    luck: doc.luck,
});

const TarotModel= mongoose.model('Tarot', TarotRollSchema);
module.exports = TarotModel;
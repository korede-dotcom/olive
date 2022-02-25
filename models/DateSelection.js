const mongoose = require('mongoose');
const Schema = mongoose.Schema;





const DateSelectionSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
        new: true
        // unique: true
    },
    selected: {
        type: Boolean,
        required: true
    },
    audition: {
         type: mongoose.Types.ObjectId,
        required: true
    },
    provider: {
         type: mongoose.Types.ObjectId,
        required: true
    }
});

module.exports = mongoose.model('DateSelection', DateSelectionSchema);
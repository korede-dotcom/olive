const mongoose = require('mongoose');
const Schema = mongoose.Schema;





const DateSelectionSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    selected: {
        type: Boolean,
        required: true
    },
    audition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Audition',
        required: true
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    }
});

module.exports = mongoose.model('DateSelection', DateSelectionSchema);
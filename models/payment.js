const mongoose = require('mongoose');


const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    provider: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    amount: {   
        type: Number,
        required: true
    },
    paymentRef: {
        type: String,
        required: true
    },
    paymentStatus : {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payment', paymentSchema);
    
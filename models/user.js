const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true, 
    },
    name: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    roleId: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        required: true
    },
    Image: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    end_at: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('User', userSchema);

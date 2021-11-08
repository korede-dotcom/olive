const mongoose = require('mongoose');
const User = require("./user")
const providerSchema = require("./provider")

const adminSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    user: {
        ref: 'User'
    },
    provider:{
        ref: 'providerSchema'
    },
   

})

module.exports = mongoose.model('Admin', adminSchema);
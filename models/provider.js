const mongoose = require('mongoose');
const User = require('../models/user');
const auditionSchema = require('../models/audition');
const providerSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type:String,
        required:true
    },
    roleId:{
        type:String,
        required:true
    },
    logo:{
        type:String,
        required:true
    },
    created_at: {
        type: Date,
        default: Date.now
    },

})

module.exports = mongoose.model('Provider', providerSchema);

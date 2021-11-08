const mongoose = require('mongoose');
const User = require('../models/user');
const auditionSchema = require('../models/audition');
const providerSchema = new mongoose.Schema({

    username: {
        type: String,
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
    },
    reated_at: {
        type: Date,
        default: Date.now
    },
    end_at: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('Provider', providerSchema);

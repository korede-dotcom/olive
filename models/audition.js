const mongoose = require('mongoose');
const auditionSchema = new mongoose.Schema([{
    
    auditionName:{
        type: String,
        required: true
    },
    auditionLogo:{
        type: String,
        required: true
    },
    roleId:{
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    end_at: {
        type: Date,
        default: Date.now
    },
    
    
}])


module.exports = mongoose.model('Audition', auditionSchema);


const mongoose = require('mongoose');
const activitiesSchema = new mongoose.Schema([{

    auditionId:{
        type: mongoose.Types.ObjectId,
        required: true
    },
    userId:{
        type: mongoose.Types.ObjectId,
        required: true
    },
    provider:{
        type: mongoose.Types.ObjectId,
        required: true
    },
    status:{
        type:Boolean,
        required:true
    },
    created_at:{
        type: Date,
        default: Date.now
    },
    end_at:{
        type: Date,
        default: Date.now
    }

    



}])



module.exports = mongoose.model('Activities', activitiesSchema);
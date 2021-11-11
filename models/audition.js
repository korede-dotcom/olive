const mongoose = require('mongoose');
const auditionSchema = new mongoose.Schema([{
    
    auditionName:{
        type: String,
        required: true
    },
    auditionDescription:{
        type: String,
    },
    auditionStartDate:{
        type: String,
        required: true
    },
    auditionEndDate:{
        type: String,
        required: true
    },
    auditionLogo:{
        type: Object,
        
    },
    roleId:{
        type: String,
        required: true
    },
    provider:{
        type: mongoose.Types.ObjectId,
        required: true
    },
    // auditionType:{
    //     type: Number,
    //     required:true
    // },
    auditionPrice:{
        type: Number,
        required:true
    },
    auditionCharges:{
        type: Number,
        required:true
    },
    auditionPattern:{
        type:String,
        required:true
    },
    created_at: {
        type: Date,
        default: Date.now
    },

    
    
    
}]);   
    // mongoose image schema
    // image schema
    


module.exports = mongoose.model('Audition', auditionSchema);


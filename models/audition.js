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
        type: String,
        required: true
        
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
        
    },
    auditionCharges:{
        type: Number,
        required:true
    },
    auditionPattern:{
        type:Number,
        required:true
    },
    auditionLink:{
        type:String
    },
    auditionCount:{
        type:Number,
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


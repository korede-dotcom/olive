const mongoose = require('mongoose');
const auditionParticipants = new mongoose.Schema([{
    userId:{
        type: mongoose.Types.ObjectId,
        required: true
    },
    auditionDetails:[{
        type: Array,
        required: true
    }],
    joined_at: {
        type: Date,
        default: Date.now
    },

    
    
    
}]);   
    // mongoose image schema
    // image schema
    


module.exports = mongoose.model('Participants', auditionParticipants);


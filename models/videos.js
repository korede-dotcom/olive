const mongoose = require('mongoose');
const videoSchema = new mongoose.Schema([{
    username: String,
    url: String,
    user:  mongoose.Types.ObjectId,
    provider:  mongoose.Types.ObjectId,
    audition:  mongoose.Types.ObjectId,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}]);
module.exports = mongoose.model('Videos', videoSchema);

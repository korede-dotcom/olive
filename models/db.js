const mongoose = require("mongoose")

connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            
        })
        console.log("MongoDB Connected")
    } catch (error) {
        console.log(error)
    }
}

module.exports = connectDB
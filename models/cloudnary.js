
const cloudinary = require('cloudinary').v2;

const cloudinaryv2 = cloudinary.config({ 
    cloud_name: process.env.CloudnaryName, 
    api_key: process.env.CloudnaryKey,
    api_secret: process.env.CloudnarySecret,
    secure: true
  });



  module.exports = cloudinaryv2;
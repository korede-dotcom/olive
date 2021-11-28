
const cloudinary = require('cloudinary').v2;

const cloudinaryv2 = cloudinary.config({ 
  c_Name: process.env.CloudnaryName, 
    api_key: process.env.CloudnaryKey,
    api_secret: process.env.c,
    secure: true
  });



  module.exports = cloudinaryv2;
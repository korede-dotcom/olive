const cloudinary = require('cloudinary').v2;
const cloud = require("../cloudinarykeys")

cloudinary.config({ 
  cloud_name: cloud.c_Name, 
  api_key: cloud.c_Key, 
  api_secret: cloud.c_Secret,
  });

    module.exports = cloudinary;
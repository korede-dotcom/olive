const multer = require('multer');
const path = require('path');

// set multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});



// set the storage engine
const uploader = multer({ storage: storage });

// multer configuration



module.exports = uploader;
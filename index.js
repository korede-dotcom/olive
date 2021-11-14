const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser") 
const cors = require("cors");
const cookeParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const path = require("path")
const router = require("./routes/router");
const provider = require("./routes/provider");
const dotenv = require("dotenv").config()


const app = express();
require("./models/db")();
// app.use(function (req, res, next) {
//     console.log(req.files); // JSON Object
//     next();
//   });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const store = new MongoStore({
    uri:  process.env.MONGO_URI,
    collection: "sessions"
});






app.use(cors())
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs");
app.use(session({
    secret: process.env.SS,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 2  
    },
    store: store
}));

app.set('views', path.join(__dirname, 'views'));
app.use("/provider",provider)
app.use(cookeParser())
app.use(router)








const port = process.env.PORT  || 1200 ;

app.listen(port , ()=> console.log(`server running on port ${port} `))
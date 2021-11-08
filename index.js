const express = require("express");
const bodyParser = require("body-parser") 
const cors = require("cors");
const cookeParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const path = require("path")
const router = require("./routes/router");
const provider = require("./routes/provider");
require("dotenv").config();


const app = express();
require("./models/db")();




app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.json())
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs");
app.set('views', path.join(__dirname, 'views'));
app.use("/provider",provider)
app.use(cookeParser())
app.use(router)








const port = process.env.PORT  || 1200 ;
app.listen(port , ()=> console.log(`server running on port ${port} `))
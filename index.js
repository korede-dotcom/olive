const express = require("express");
const bodyParser = require("body-parser") 
const cors = require("cors");
const path = require("path")
const router = require("./routes/router");

const app = express();



app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.json())
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs");
app.set('views', path.join(__dirname, 'views'));

app.use(router)



const port = 1200 || process.env.PORT;
app.listen(port , ()=> console.log(`server running on port ${port} `))
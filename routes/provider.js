const express = require("express")
const provider = express.Router()
const Audition = require("../models/audition")
const Provider = require("../models/provider")
const path = require("path")
const multer = require("multer")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../public/uploads/"))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
  const upload = multer({ storage: storage })

// login
provider.get("/",(req,res)=>{
    res.render("provider/login")
    
})

// post login
provider.post("/",(req,res)=>{
    const {username,password} = req.body
    console.log(username,password)
    try{
        Provider.findOne({username:username,password:password},(err,provider)=>{
            if(err){
                console.log(err)
            }
            else{
                if(provider){
                    res.redirect("/provider/dashboard")
                }
                else{
                    res.redirect("/provider")
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
   
    
})

// singup
provider.get("/signup",(req,res)=>{
    res.render("provider/register")
    
})

provider.post("/signup",(req,res)=>{
    const {name,password} = req.body;

    console.log(req.body)
    res.send("hello")

    
    // try {
    //     Provider.create({
    //         username:name,
    //         password,
    //         role:"provider",
    //         roleId:"2"
    //     })
    //  console.log(req.body)
    //     res.redirect("/")
        
    // } catch (error) {

    //     res.redirect("/signup")
        
    // }
})



provider.get("/dashboard",(req,res)=>{
    res.render("provider/dashboard")
})


provider.get("/add/auditions",(req,res)=>{
    
    try {     
    Audition.create({
        "auditionName":"cola",
        "auditionLogo":"logo",
        "roleId": "2"
    })
    console.log("Audition Created")
    res.send("done")

    } catch (error) {
        console.log(error)
    }
})
provider.get("/auditions",(req,res)=>{

})
provider.get("/audition/delete:id",(req,res)=>{

})


module.exports = provider
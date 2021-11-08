const express = require("express")
const provider = express.Router()
const Audition = require("../models/audition")
const Provider = require("../models/provider")

// login
provider.get("/",(req,res)=>{
    res.render("provider/index")
    
})

// post login
provider.post("/",(req,res)=>{

    try {     
        Provider.create({
            "username": "08088929",
            "password": "12345678",
            "role": "provider",
            "roleId": "2",
        })
        console.log("Audition Created")
        
    } catch (error) {
        console.log(error)
    }
    
})

// singup
provider.get("/signup",(req,res)=>{
    res.render("provider/signup")
    
})

// post singup
provider.post("/provider/signup",(req,res)=>{
    const {name,password} = req.body;
    try {
        Provider.create({
            username:name,
            password,
            role:"provider",
            roleId:"2"
        })
    //  console.log(req.body)
        res.redirect("/")
        
    } catch (error) {

        res.redirect("/signup")
        
    }
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
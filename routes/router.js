const express = require("express");
const router = express.Router();
const axios = require("axios")
const User = require("../models/user")
const Provider = require("../models/provider")
const Audition = require("../models/audition")
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const globals = require('node-global-storage');
const {requireAuth }= require("../middleware/middleware");




function fiveRandomNumbers(){
    let numbers = []
    for(let i=0;i<5;i++){
        numbers.push(Math.floor(Math.random()*9))
    }
    return numbers
}

// maxAge 2hrs
const maxAge = 7200000;


const createToken = (id) => {
  return jwt.sign({ id },process.env.JWTSECRET, {
    expiresIn: maxAge
  });
};

const otp = fiveRandomNumbers().join("")
console.log(otp)

router.get("/",(req,res)=>{
    res.render("auth")
})

router.post("/",(req,res)=>{
    const {username,password} = req.body
    try {
        User.findOne({username},(err,user)=>{
          
            if(user){
                res.send({"error":"User already exists"})
            }else{
                const newUser = new User({
                    username,
                    password,
                    role:"user",
                    roleId:"1",
                    otp:otp
                })
                newUser.save((err,user)=>{
                    console.log(user)
                    res.locals.userId = user._id
                    globals.set('userId', user._id, {protected: true});
                         const config = {
                        method: 'get',
                        url: `https://1960sms.com/api/send/?user=${process.env.textMsgUser}&pass=${process.env.textMsgPass}&to=${user.username}&from=hello&msg=your Olive registration OTP:${user.otp}`,
                        headers: { }
                    };
                    
                    axios(config)
                    .then(function (response) {
                        console.log(JSON.stringify(response.data));
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                        res.send({"status":"true"})
                    
                })
            }
        })
        
    } catch (error) {
        console.log(error)
    }


})




router.post("/otp",(req,res)=>{

    console.log(otp)
   const id = globals.get('userId', {protected: true});
    User.findById(id,(err,user)=>{

        if(err){
            res.send({"error":"Error in finding user"})
        }else{
            if(user.otp == otp){
                const token = createToken(user._id);
                res.cookie("jwt",token,{maxAge:maxAge * 1000});
                res.status(200).json({"status":"success"});
            }else{
                res.send({"error":"OTP is incorrect"})
            }
        }
    })
   
})


// login

router.get("/login",(req,res)=>{
    res.render("login")
})
router.post("/login",(req,res)=>{
    const {username,password} = req.body
    try {
        User.findOne({username},(err,user)=>{
            if(user){
                if(user.password === password){
                    const token = createToken(user._id);
                    res.cookie("jwt",token,{maxAge:maxAge * 1000});
                    res.status(200).json({"status":"true"});
                }else{
                    res.send({"error":"Password is incorrect"})
                }
            }else{
                res.send({"error":"User does not exist"})
            }
        })
        
    } catch (error) {
        console.log(error)
    }
})


router.get("/dashboard",requireAuth,(req,res)=>{
    
    res.render("dashboard")
})
router.get("/digitalauditionplatform",requireAuth,(req,res)=>{
    // find decending order
    Audition.find({}).sort({created_at:-1}).exec((err,auditions)=>{
        if(err){
            console.log(err)
        }else{
            res.render("dap",{auditions})
        }
    })

    
})

router.get("/digitalauditionplatform/:id",(req,res)=>{
    Audition.findById(req.params.id,(err,audition)=>{
        if(err){
            return res.render("dap",{audition})
        }else{
            res.render("audition",{audition})
        }
        
    })
})

router.get("/provider/digitalauditionplatform/:name",requireAuth,(req,res)=>{
    if(req.params.name === "bbnaija"){
    res.render("bbn")
    }
  
})












module.exports = router;
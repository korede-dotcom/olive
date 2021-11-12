const express = require("express");
const router = express.Router();
const axios = require("axios")
const User = require("../models/user")
const Provider = require("../models/provider")
const Audition = require("../models/audition")
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const globals = require('node-global-storage');
const {Authenticated }= require("../middleware/middleware");




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
                // const token = createToken(user._id);
                // res.cookie("jwt",token,{maxAge:maxAge * 1000});
                req.session.userIsLoggedIn = true;
                req.session.user = user;
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
                    req.session.userIsLoggedIn = true;
                    req.session.user = user;
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


router.get("/dashboard",Authenticated,(req,res)=>{
    
    res.render("dashboard")
})
router.get("/digitalauditionplatform",Authenticated,(req,res)=>{
    // find decending order
    Audition.find({}).sort({created_at:-1}).exec((err,auditions)=>{
        if(err){
            console.log(err)
        }else{
            res.render("dap",{auditions})
        }
    })

    
})

router.get("/digitalauditionplatform/:id",Authenticated,(req,res)=>{
    
    Audition.findById(req.params.id,(err,audition)=>{
        if(err){
            return res.render("dap",{audition})
        }else{
            if(audition.auditionCharges > 0){
            var data = JSON.stringify({"tx_ref":`${audition._id}|${audition._id}`,"amount":`${audition.auditionPrice}`,"currency":"NGN","redirect_url":`http://localhost:1200/paidaudition?audition=${audition._id}&provider=${audition.provider}&user=${req.session.user._id}`,"payment_options":"card","meta":{"consumer_id":`${audition.provider}`,"consumer_mac":`${audition.provider}`},"customer":{'email':`user@gmail.com`,"phonenumber":`${req.session.user.username}`,"name":`${req.session.user._id}`},"customizations":{"title":"Olive Auditions","description":`pay for your ${audition.auditionName} audition`,"logo":"https://assets.piedpiper.com/logo.png"}});

                const config = {
                method: 'post',
                url: 'https://api.flutterwave.com/v3/payments',
                headers: { 
                    'Authorization': `Bearer ${process.env.flutterWave}`, 
                    'Content-Type': 'application/json'
                },
                data : data
                };

                axios(config)
                .then(function (response) {
                console.log(JSON.stringify(response.data));
                res.redirect(response.data.data.link)
                })
                .catch(function (error) {
                console.log(error);
                });
            }else{
                res.render("audition",{audition})

            }


        }
        
    })
})

router.get("/paidaudition",Authenticated,(req,res)=>{
    Audition.findById(req.query.audition,(err,audition)=>{
        if(err){
            console.log(err)
        }else{
            if(req.query.status == "success"){
                const newPayment = new Payment({
                    user:req.query.user,
                    provider:req.query.provider,
                    amount:audition.auditionPrice,
                    paymentRef:req.query.tx_ref,
                    paymentStatus:req.query.status,
                })
                newPayment.save((err,payment)=>{
                    if(err){
                        console.log(err)
                    }else{
                        res.redirect("/dashboard")
                    }
                })
                   

            res.render("audition",{audition})
        
        }else{
            res.render("error")  

        }

        }
    })
    // res.redirect("/dashboard")
})

// router.get("/provider/digitalauditionplatform/:name",Authenticated,(req,res)=>{
//     if(req.params.name === "bbnaija"){
//     res.render("bbn")
//     }
  
// })












module.exports = router;
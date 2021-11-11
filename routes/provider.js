const express = require("express")
const provider = express.Router()
const Audition = require("../models/audition")
const Provider = require("../models/provider")
const path = require("path")
const multer = require("multer")
const jwt = require('jsonwebtoken');
const globals = require('node-global-storage');
const {Auth} = require("../middleware/middleware");
const bcrypt = require("bcrypt")









saltRounds = 10;
const maxAge = 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id },process.env.providerJWTSECRET, {
    expiresIn: maxAge
  });
};
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, path.join(__dirname, "../public/uploads/"))
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//       cb(null, file.fieldname + '-' + uniqueSuffix)
//     }
//   })
  
//   const upload = multer({ storage: storage })

// login
provider.get("/",(req,res)=>{
    // req.session.isLoggedIn = false;
    res.render("provider/login")
    
})

// post login
provider.post("/",(req,res)=>{

    const {email,password} = req.body
    try {
        
        Provider.findOne({email:email},(err,provider)=>{
            if(err){
                console.log(err)
            }
            if(!provider){
                res.send({"error":"Invalid username or password"})
            }
            else{
                bcrypt.compare(password,provider.password,(err,result)=>{
                    if(err){
                        console.log(err)
                    }
                    if(result){
                        req.session.isLoggin = true;
                        const token = createToken(provider._id)
                        res.cookie('providerjwt', token, {
                            maxAge: maxAge * 1000,
                        })
                        req.session.isLoggedIn = true;
                        req.session.providerId = provider._id;
                        res.status(200).json({"status":"true"});
                    }
                    else{
                        res.render({"error":"Invalid username or password"})
                    }
                })
            }
        })   
    } catch (error) {
        res.render({"error":"Invalid username or password"})
    }
    
})

// singup
provider.get("/signup",(req,res)=>{
    res.render("provider/signup")
    
})

provider.post("/signup",(req,res)=>{
    const {username,email,password} = req.body;
    try {
        Provider.findOne({email:email},(err,provider)=>{
            if(err){
                console.log(err)
            }
            else{
                if(provider){
                    res.send({"error":"User already exists"})
                }
                else{
                    bcrypt.hash(password, saltRounds, function(err, hash) {
                        if(err){
                            console.log(err)
                        }
                        else{
                            Provider.create({
                                username:username,
                                email:email,
                                password:hash,
                                role:"provider",
                                roleId:2,
                            },(err,provider)=>{
                                
                                if(err){
                                    console.log(err)
                                }
                                else{
                                    const token = createToken(provider._id);
                                    res.cookie("providerjwt",token,{maxAge:maxAge * 1000});
                                    res.status(200).json({"status":"true"});
                                    
                                    // res.redirect("/provider")
                                }
                            })
                        }
                    });
                
                }
            }
        })

     
        
    } catch (error) {
        res.redirect("/signup")   
    }
})


// GET PROFILE

provider.get("/profile",Auth,(req,res)=>{
        res.render("provider/profile")
})
provider.post("/profile",Auth,(req,res)=>{
    const {username,email,password} = req.body;

    // bcrypt.compare(password,req.provider.password,(err,result)=>{
    //     if(err){    
    //         console.log(err)
    //     }
    //     if(result){
    //         Provider.findByIdAndUpdate(req.provider._id,{
    //             username:username,
    //             email:email,
    //             password:password,
    //         },(err,provider)=>{
    //             if(err){
    //                 console.log(err)
    //             }
    //             else{
    //                 res.status(200).json({"status":"true"});
    //             }
    //         })
        
       Provider.updateOne({_id:req.session.providerId},{$set:{
              username:req.body.username,
                email:req.body.email,
                password:req.body.password,
                role:"provider",
                roleId:2,
            }},(err,provider)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.redirect("/provider/profile")
                }
            })
})
// END PROFILE


//  CREATE AUDITION
provider.get("/createaudition",Auth,(req,res)=>{
        res.render("provider/createaudition")
})

provider.post("/createaudition",Auth,(req,res)=>{
    const {auditionName,auditionDescription,
        auditionStartDate,auditionEndDate,auditionCharges,
        auditionLogo,auditionPrice,auditionPattern
    } = req.body
    console.log(req.body)
    console.log(req.session.providerId)

    Provider.findOne({_id:req.session.providerId},(err,provider)=>{
        if(err){
            console.log(err)
        }
        else{
            if(provider){
               
                Audition.create({
                    auditionName,
                    auditionDescription,
                    auditionStartDate,
                    auditionEndDate,
                    auditionLogo,
                    auditionCharges,
                    auditionPrice,
                    auditionPattern,
                    roleId:2,
                    provider:provider._id
                },(err,audition)=>{
                    if(err){
                        console.log(err)
                    }
                    else{
                        
                        res.send(audition)
                    }
                })
            }
        }
    })
    
  
})
// END CREATE AUDITION


// GET DASHBOARD
provider.get("/dashboard",Auth,(req,res)=>{
    res.render("provider/dashboard")
})


// END GET DASHBOARD



provider.get("/auditions",Auth,(req,res)=>{

})
provider.get("/audition/delete:id",Auth,(req,res)=>{

})


provider.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/provider")
})

module.exports = provider;



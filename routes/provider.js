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
var fs = require('fs');
const audition = require("../models/audition")
const upload = require("../utils/multer")
const cloudinary = require("../utils/cloudinary")







saltRounds = 10;
const maxAge = 60 * 60;


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
                        
                        req.session.isLoggedIn = true;
                        req.session.providerId = provider._id;
                        req.session.providerDetails = provider;
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
    let provider = req.session.providerDetails;
        res.render("provider/profile",{provider})
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


// how to upload with multer

//  CREATE AUDITION
provider.get("/createaudition",Auth,(req,res)=>{
    let provider = req.session.providerDetails;
        res.render("provider/createaudition",{provider})
})


provider.post("/createaudition",upload.single('auditionLogo'),async (req,res)=>{
    
    const {auditionName,auditionDescription,auditionStartDate,auditionEndDate,auditionCharges,auditionPrice,auditionPattern} = req.body;
 const result = await cloudinary.uploader.upload(req.file.path) 
 let newAudition = new Audition({
    auditionName,
    auditionDescription,
    auditionStartDate,
    auditionEndDate,
    auditionLogo:result.secure_url,
    auditionCharges,
    auditionPrice,
    auditionPattern,
    roleId:2,
    provider:req.session.providerId,
 })
 await newAudition.save((err,audition)=>{
        if(err){
            console.log(err)
        }
        else{
          
            res.send({"status":"true"})
        }
 })
       
    
});
    

            




//    cloudinary.uploader.upload(req.file.path, function(result) {
//     console.log(result)
//     res.send(result)



// provider.post("/createaudition",(req,res)=>{
    // console.log(req)
    // res.send(req.body)
    // const {auditionName,auditionDescription,
    //     auditionStartDate,auditionEndDate,auditionCharges,
    //     auditionLogo,auditionPrice,auditionPattern
    // } = req.body
    // console.log(req.body)
    // console.log(req.files)
    // console.log(req.session.providerId)

   
    
  
// })
// END CREATE AUDITION


// GET DASHBOARD
provider.get("/dashboard",Auth,(req,res)=>{
    // find provider
   
    Provider.findOne({_id:req.session.providerId},(err,provider)=>{
        if(err){
            console.log(err)
        }
        else{
            if(provider){
                res.render("provider/dashboard",{provider})
                
            }
        }
    })
})


// END GET DASHBOARD



provider.get("/auditions",Auth,(req,res)=>{
    let provider = req.session.providerDetails;
    Audition.find({provider:req.session.providerId},(err,auditions)=>{
        if(err){
            console.log(err)
        }
        else{
            res.render("provider/auditions",{auditions,provider})
        }
    })


})
provider.get("/auditions/:id",Auth,(req,res)=>{
    // find on provider
    Provider.findOne({_id:req.session.providerId},(err,provider)=>{
        if(err){
            console.log(err)
        }
        else{
            if(provider){
                // find on audition
                Audition.findOne({_id:req.params.id},(err,auditions)=>{
                    if(err){
                        console.log(err)
                    }
                    else{
                        if(audition){
                            res.render("provider/oneaudition",{auditions,provider})
                        }
                    }
                })

    // find one audition
            }
        }
    }) 


})
provider.get("/auditions/delete/:id",Auth,(req,res)=>{
    let provider = req.session.providerDetails;
    // delete one audition
    // delete one audition
    Audition.findByIdAndDelete(req.params.id,(err,auditions)=>{
        if(err){
            console.log(err)
        }else{
            if(auditions){
                res.render("/provider/auditions")
            }
            
        }
    })

})


provider.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/provider")
})

module.exports = provider;



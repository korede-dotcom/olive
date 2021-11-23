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
const moment = require("moment")
const Payment = require("../models/payment")







saltRounds = 10;
const maxAge = 60 * 60;


const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "koredebada@gmail.com",
        pass: "Sulaimon4896"
    }
});
transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take messages");
    }
});


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

provider.post("/signup",upload.single("logo"),async (req,res)=>{
    const {username,email,password} = req.body;
    const result = await cloudinary.uploader.upload(req.file.path) 
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
                                logo:result.secure_url,
                                role:"provider",
                                roleId:2,
                            },(err,provider)=>{
                                req.session.isLoggedIn = true;
                                transporter.sendMail({
                                    from: "koredebada@gmail.com",
                                    to: email,
                                    subject: "Welcome to Olive",
                                    text: `Hi ${username},\n\nWelcome to Olive Provider.\n\nYour Registration was Sucessful.\n\nThank you for choosing Olive.\n\nRegards,\nOlive Team`
                                })
                                .then(()=>{
                                    console.log("email sent")
                                })
                                .catch(err=>{
                                    console.log(err)
                                })

                                
                                if(err){
                                    console.log(err)
                                }
                                else{
                            
                                    res.status(200).json({"status":"true"});
                                   
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


provider.post("/createaudition",Auth,upload.single('auditionLogo'),async (req,res)=>{
    
    const {auditionName,auditionDescription,auditionStartDate,auditionEndDate,auditionCharges,auditionPrice,auditionPattern,auditionCount} = req.body;
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
    auditionCount,
    roleId:2,
    auditionLink:"",
    provider:req.session.providerId,
 })
 await newAudition.save((err,audition)=>{
     console.log(audition)
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
    // find provider and agg
     const agg = [{
        $lookup: {
            from: 'payments',
            localField: '_id',
            foreignField: 'provider',
            as: 'myauditions'
        }
    }, {
        $match: {
            _id: req.session.providerId
        }
    }]
   
    Provider.aggregate(agg,(err,providers)=>{
        if(err){
            console.log(err)
        }
        else{
           if(providers){
               console.log(providers)
                let provider = providers[0];
                const myauditions = provider.myauditions;
                // calculate total earnings
                let totalEarnings = 0;
                myauditions.forEach(audition=>{
                    totalEarnings += parseInt(audition.amount)
                })
            
                let totalUsers = myauditions.length;



          Audition.find({provider:req.session.providerId},(err,auditions)=>{
                    if(err){
                        console.log(err)
                    }
                    else{
                        // const topAuditions = auditions.slice(0,3);
                        const topAuditions = auditions.map(audition=>{
                            return audition.auditionPrice > 0 ? audition : null
                        }).filter(audition=>{
                            return audition != null
                        })

                        let totalAuditions = auditions.length
                

                       Payment.find({provider:req.session.providerId},(err,payments)=>{
                            if(err){
                                console.log(err)
                            }
                            else{
                               const Tpayment = payments.map(payment=>{
                                    return payment.createdAt === new Date().getDate(payment.createdAt)
                                })
                                console.log(Tpayment)
                                res.render("provider/dashboard",{provider,totalEarnings,totalUsers,totalAuditions,topAuditions})
                                
                            }
                        })
                       

                        // res.render("provider/dashboard",{provider,totalEarnings,myauditions,totalUsers,totalAuditions,auditions,topAuditions})
                    }
                })
                
            

                    
                

           }
                               
            
        }
    })
})


// count visits


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


// generate audition link

provider.post("/getlink",(req,res)=>{
    const {auditionId} = req.body;
    Audition.findByIdAndUpdate({'_id':auditionId.toString()},{auditionLink:`http://localhost:1200/auditionlink/?auditionId=${auditionId}`},(err,audition)=>{
        if(err){
            console.log(err)
        }
        else{
            res.status(200).json({"status":"true"});
        }
    })


    // Audition.findOneAndUpdate({_id:auditionId},{$set:{
    //     auditionLink:`http://localhost:1200/auditionlink/?auditionId=${auditionId}`
    // }},(err,audition)=>{
    //     if(err){
    //         console.log(err)
    //     }
    //     else{
    //         res.send(audition)
    //     }
    // })


    function generateLink(){
        let link = "";
        for(let i=0;i<6;i++){
            link += Math.floor(Math.random()*10)
        }
        return link
    }

    
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
                res.redirect("/provider/auditions")
            }
            
        }
    })

})


provider.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/provider")
})

module.exports = provider;



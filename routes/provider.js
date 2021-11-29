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
const mailjet = require ('node-mailjet')
.connect(process.env.c1, process.env.c2)







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
                                const request = mailjet
                                .post("send", {'version': 'v3.1'})
                                .request({
                                  "Messages":[
                                    {
                                      "From": {
                                        "Email": "koredebada@gmail.com",
                                        "Name": "Olive Team"
                                      },
                                      "To": [
                                        {
                                          "Email": email,
                                          "Name": username
                                        }
                                      ],
                                      "Subject": "Welcome to Olive Provider",
                                      "TextPart": `Hi ${username}\n,Welcome to Olive Provider your Registration was Sucessful \n Thanks for Joining Olive\n Best regard \n Olive Team`,
                                    //   "HTMLPart": "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
                                    //   "CustomID": "AppGettingStartedTest"
                                    }
                                  ]
                                })
                                request
                                  .then((result) => {
                                    console.log(result.body)
                                  })
                                  .catch((err) => {
                                    console.log(err.statusCode)
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
provider.get("/dashboard",Auth, async (req,res)=>{
    const provider = await Provider.findById(req.session.providerId)
     const auditions = await Audition.find({provider:req.session.providerId})
    try {

        Payment.find({provider:req.session.providerId}, async (err,payments)=>{
            if(err){
                console.log(err)
            }
            else{
             
                
                if(payments.length>0){
                    let totalPayment = await Payment.aggregate([
                        {$match:{provider:req.session.providerId}},
                        {$group:{_id:null,totalPayment:{$sum:"$amount"}}}
                      
                    ])
                  
                    const totalPaymentAmount = totalPayment[0].totalPayment
                    // Revenue /////////////// 
                    console.log(totalPaymentAmount)
                     let totalAuditionCount = await Audition.aggregate([
                        {$match:{provider:req.session.providerId}},
                        {$group:{_id:null,totalAuditionCount:{$sum:1}}}
                    ])
                    const totalAuditionCountAmount = totalAuditionCount[0].totalAuditionCount
                    console.log(totalAuditionCount)
                    // total Audition //////////////////
                
                     let totalUser = await Payment.aggregate([
                        {$match:{provider:req.session.providerId}},
                        {$count:"user"}
                    ])
                    const totalUserAmount = totalUser[0].user
                    console.log(totalUser)
                    // total User //////////////////
                
                        let todayPayment = await Payment.aggregate([
                        {$match:{provider:req.session.providerId}},
                        {$match:{createdAt:{$gte:new Date(new Date().setHours(0,0,0,0))}}},
                        {$group:{_id:null,todayPayment:{$sum:"$amount"}}}
                    ])
                   
                    // ternay operator ///////////////
                    let todayPaymentAmount = todayPayment>0?todayPayment:todayPayment[0].todayPayment

                    // today Payment //////////////////
                
                    // get user that paid today
                    let todayUser = await Payment.aggregate([
                        {$match:{provider:req.session.providerId}},
                        {$match:{createdAt:{$gte:new Date(new Date().setHours(0,0,0,0))}}},
                        {$count:"user"}
                    ])
                    console.log(todayUser)

                    // list Auditions and their total earnings
                    let auditions = await Audition.find({provider:req.session.providerId})
                    let auditionsEarnings = await Audition.aggregate([
                        {$match:{provider:req.session.providerId}},
                        {$group:{_id:"$auditionName",totalEarnings:{$sum:"$auditionPrice"}}},
                        {$project:{_id:0,auditionName:"$_id",totalEarnings:1,_id:0}},
                        {$sort:{totalEarnings:-1}},
                        {$limit:5}
                        

                    ])
                    console.log(auditionsEarnings)
                    // list Auditions and their today earnings
                    let auditionsTodayEarnings = await Audition.aggregate([
                        {$match:{provider:req.session.providerId}},
                        {$match:{createdAt:{$gte:new Date(new Date().setHours(0,0,0,0))}}},
                        {$group:{_id:"$auditionName",totalEarnings:{$sum:"$auditionPrice"}}},
                        {$project:{_id:0,auditionName:"$_id",totalEarnings:1,_id:0}},
                        {$sort:{totalEarnings:-1}},
                        {$limit:5}
                    ])
                    

                    res.render("provider/dashboard",{todayPaymentAmount,totalPaymentAmount,totalAuditionCountAmount,totalUserAmount,topAuditions:[],provider,auditions,auditionsEarnings})
                    if(payments.length === 0 || []){
                        res.render("provider/dashboard",{todayPaymentAmount:0,totalPaymentAmount:0,totalAuditionCountAmount:0,totalUserAmount:0,topAuditions:[],provider,auditions,auditionsEarnings})
                    }
                }else{
                    // if no payments
                    if(!payments){
                    res.render("provider/dashboard",{todayPaymentAmount:0,totalPaymentAmount:0,totalAuditionCountAmount:0,totalUserAmount:0,topAuditions:[],provider,auditions,auditionsEarnings})
                    }
                    
                }
            }
        })

   
}catch(err){
    console.log(err.message)
}

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



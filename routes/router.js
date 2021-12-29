const express = require("express");
const router = express.Router();
const axios = require("axios")
const User = require("../models/user")
const Provider = require("../models/provider")
const Audition = require("../models/audition")
const Payment = require("../models/payment")
const {Authenticated , LinkAuthenticated} = require("../middleware/middleware");
const uuidv4 = require("uuid").v4;
const Participants = require("../models/auditionParticipants")
const cloudinary = require("../utils/cloudinary")
// axios form data
// const upload = require("../utils/multer")
const bcrypt = require("bcryptjs");
const {
    upload,
    videoUpload
} = require("../utils/multer");
const mailjet = require ('node-mailjet')
.connect(process.env.c1, process.env.c2)
const fs = require("fs")
const path = require("path")
const Video = require("../models/videos")
const DateSelection = require("../models/DateSelection")
const jwt = require("jsonwebtoken");



// 


function fiveRandomNumbers(){
    let numbers = []
    for(let i=0;i<5;i++){
        numbers.push(Math.floor(Math.random()*10))
    }
    return numbers
}

const randomNumbers = fiveRandomNumbers()
console.log(randomNumbers.join(""))
// maxAge 2hrs
const maxAge = 7200000;


// const createToken = (id) => {
//   return jwt.sign({ id },process.env.JWTSECRET, {
//     expiresIn: maxAge
//   });
// };

const otp = fiveRandomNumbers().join("")

// console.log(otp)




// initialize nodemailer







router.get("/",(req,res)=>{
    res.render("login")
})








router.post("/",(req,res)=>{
  
    const {username,password,email,name} = req.body
    console.log(req.body)

    try {
        User.findOne({username,email}, async(err,user)=>{
            if(user){
                res.send({"error":"User already exists"})
            }else{
        //    hash password with bcryptjs
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(hashedPassword)
                let newUser = new User({
                    username,
                    password:hashedPassword,
                    email,
                    name,
                    role:"user",
                    roleId:"1",
                    otp:otp
                })
                newUser.save((err,user)=>{
                    req.session.user = user
                    const request = mailjet
                    .post("send", {'version': 'v3.1'})
                    .request({
                      "Messages":[
                        {
                          "From": {
                            "Email": "koredebada@gmail.com",
                            "Name": "Ghenghen Team"
                          },
                          "To": [
                            {
                              "Email": email,
                              "Name": name
                            }
                          ],
                          "Subject": "Welcome to Ghenghen",
                          "TextPart": `Hi ${name}\n,Welcome to Ghenghen your OTP is ${otp} \n Thanks for Joining Ghenghen\n Best regard \n Ghenghen Team`,
                       
                     
                          "HTMLPart": ``,
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

                         const config = {
                        method: 'get',
                        url: `https://1960sms.com/api/send/?user=${process.env.textMsgUser}&pass=${process.env.textMsgPass}&to=${username}&from=hello&msg= ${name}your Ghenghen registration OTP:${otp}`,
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
//    const id = globals.get('userId', {protected: true});
    User.findById(req.session.user._id,(err,user)=>{

        if(err){
            res.send({"error":"Error in finding user"})
        }else{
            if(user.otp == otp){
                // const token = createToken(user._id);
                // res.cookie("jwt",token,{maxAge:maxAge * 1000});
               req.session.LinkAuthenticated = true;
                // req.session.user = user;
                res.status(200).json({"status":"success"});
            }else{
                res.send({"error":"OTP is incorrect"})
            }
        }
    })
   
})


// login

router.get("/signup",(req,res)=>{
    res.render("auth")
})
router.post("/login",(req,res)=>{
    const {username,password} = req.body
    try {
        User.findOne({username},(err,user)=>{
            if(err){
                res.send({"error":"User not Exist"})
            }
            if(user){
                // compare password
                bcrypt.compare(password, user.password, (err, result) => {
                    if (result) {
                        req.session.userIsLoggedIn = true;
                                req.session.user = user;
                               res.status(200).json({"status":"true"});
                    } else {
                        res.send({"error":"Password is incorrect"})
                    }
                });
            }else{
                res.send({"error":"User not Exist"})
            }
        })
        
    } catch (error) {
        console.log(error)
    }
})


router.get("/dashboard",Authenticated,(req,res)=>{ 
    res.render("dashboard")
})



router.get("/digitalauditionplatform",Authenticated,async(req,res)=>{
    try{
        const payments = await Payment.find({user:req.session.user._id})
        console.log(payments)
        const user = await User.findById(req.session.user._id)
        if(payments.length>0){
            Audition.find({_id:{$in:payments.map(payment=>payment.auditionId)}},(err,audition)=>{
                if(err){
                    res.send({"error":"Error in finding audition"})
                }else{
                    Audition.find({}).sort({created_at:-1}).exec((err,auditions)=>{
                        if(err){
                            res.send({"error":"Error in finding audition"})
                        }else{
                            res.render("dap",{auditions,audition,user})
                        }
                    })
                    // res.render("dap",{audition})
                }
            })
                    
        }else{
            Audition.find({}).sort({created_at:-1}).exec((err,auditions)=>{
                if(err){
                    res.send({"error":"Error in finding auditions"})
                }else{
                    res.render("dap",{auditions,user,audition:[]})
                }
            })
          
        }


    }catch(error){
        console.log(error)
    }
    // find decending order
    // fina
    // Audition.find({}).sort({created_at:-1}).exec((err,auditions)=>{
    //     if(err){
    //         console.log(err)
    //     }else{
    //         // payment by user
    //         Payment.find({userId:req.session.user._id}).sort({created_at:-1}).exec((err,payments)=>{
    //             if(err){
    //                 console.log(err)
    //             }else{
                    
    //                 if(payments.length>0){
    //                     // find audition by payments.auditionId
    //                     // find payments.auditionId in audition

    //                     Audition.find({_id:{$in:payments.map(payment=>payment.auditionId)}},(err,audition)=>{
    //                         if(err){
    //                             console.log(err)
    //                         }else{
    //                             res.render("dap",{auditions,audition,user:req.session.user})
    //                         }
    //                     })
                       
    //                 }else{

    //                     res.render("dap",{auditions,audition:[],user:req.session.user})
    //                 }
    //             }
    //         })
    //     }
    // })

    
})



router.get("/profile",Authenticated,(req,res)=>{
    User.findById(req.session.user._id,(err,user)=>{
        if(err){
            console.log(err)
        }else{
            res.render("profile",{user})
        }
    })
})



// patch

router.post("/profile/:id",Authenticated,upload.single('logo'),async(req,res)=>{
    const {username,password,email} = req.body
    
    const id = req.params.id
    if(req.file){
        const result = await cloudinary.uploader.upload(req.file.path) 

        try {
            const user = await User.findByIdAndUpdate(id,{username,password,email,Image:result.secure_url},{new:true})
            if(user){
                res.status(200).json({"status":"success"})
            }
        } catch (error) {
            res.send({"error":"Error in updating profile"})
            console.log(error)
        }
    }
    else{
        try {
            const user = await User.findByIdAndUpdate(id,{username,password,email},{new:true})
            if(user){
                res.status(200).json({"status":"success"})
                // unlink the file
                fs.unlinkSync(req.file.path)

            }
        } catch (error) {
            res.send({"error":"Error in updating profile"})
            console.log(error)

        }
    }

    // await  User.findByIdAndUpdate(id,{username,password,email,Image:result.secure_url},(err,user)=>{
    //     if(err){
    //         res.send({"error":"Error in updating profile"})
    //     }else{
    //         req.session.user = user
    //         res.send({"status":"success"})
    //     }
    // })
})


router.get("/auditions/:id",Authenticated,(req,res)=>{
    // find user in Payment collection    
    let video = ""
    let dateSelection;
    Payment.find({user:req.session.user._id},(err,payments)=>{
        if(err){
            console.log(err)
        }else{
            if(payments){
                            // find audition from payments by auditionId in
                Audition.findById(req.params.id,(err,auditions)=>{
                    if(err){
                        console.log(err)
                    }else{
                        if(auditions.auditionPattern === 0){
                            Video.findOne({user:req.session.user},(err,video)=>{
                                if(err){
                                    console.log(err)
                                }else{
                                    if(video){
                                        console.log(video)
                                        res.render("userAuditions",{dateSelection:false,video:video,auditions,payments,user:req.session.user})
                                    }else{
                                        res.render("userAuditions",{dateSelection:false,video:false,auditions,payments,user:req.session.user})
                                    }
                                }
                            })   
                        }else{
                            DateSelection.findOne({user:req.session.user},(err,dateSelection)=>{
                                if(err){
                                    console.log(err)
                                }else{
                                    if(dateSelection){
                                       
                                        res.render("userAuditions",{video,dateSelection:dateSelection,auditions,payments,user:req.session.user})
                                    }else{
                                        res.render("userAuditions",{video,dateSelection:false,auditions,payments,user:req.session.user})
                                        // Video.findOne({audition:req.params.id},(err,video)=>{
                                        //     if(err){
                                        //         console.log(err)
                                        //     }else{
                                        //         if(video){
                                        //             console.log(video)
                                        //             res.render("userAuditions",{video,auditions,payments,user:req.session.user})
                                        //         }else{
                                        //             res.render("userAuditions",{auditions,payments,user:req.session.user})
                                        //         }
                                        //     }
                                        // })
                                        // res.render("userAudition",{auditions,payments,user:req.session.user})
                                    }
                                }
                            })
                        }

                                // res.render("audition",{auditions,payments,dateSelection})
                        
                    }
                })
            }else{
                res.redirect("/digitalauditionplatform")
            }
                              
        }
    })
})
    //         if(payments){
    //             // find audition from payments by auditionId in
    //             Audition.findById(req.params.id,(err,audition)=>{
    //                 if(err){
    //                     console.log(err)
    //                     }else{
    //                         if(audition){
    //                             res.render("userAudition",{audition})
    //                             }else{
    //                                 res.send({"error":"Audition not found"})
    //                                 }
    //             ))


    //             // Audition.find({_id:{$in:payments.map(payment=>payment.auditionId)}},(err,auditions)=>{
                    
    //             //     if(err){
    //             //         console.log(err)
    //             //     }else{
    //             //         if(auditions){
    //             //             // sort by date
    //             //           const latest =  auditions.sort((a,b)=>{
    //             //                 return new Date(b.created_at) - new Date(a.created_at)
    //             //             })
    //             //                 res.render("userAuditions",{auditions:latest,user:req.session.user})
                                
    //             //         }else{
    //             //             res.send({"error":"No auditions"})
    //             //         }
    //             //     }
    //             // })
               
    // } 
    //     }
//     })
   
    
// })

router.post("/digitalauditionplatform",Authenticated,(req,res)=>{
    const {auditionId,user} = req.body
    // push uadition to
    console.log(auditionId,user)
    try {
        Audition.findById(auditionId,(err,audition)=>{
            if(err){
                console.log(err)
            }else{
            //   populate audition to user
            console.log(audition)

               if(audition){
                   
                   Payment.create({
                    user:req.session.user._id,
                    provider:audition.provider,
                    amount:audition.auditionPrice,
                    auditionName:audition.auditionName,
                    auditionId:audition._id,
                    paymentRef:req.query.txref,
                    paymentStatus:"successful",
                            
                   },(err,payment)=>{
                          if(err){
                            console.log(err)
                          }else{
                            if(payment){
                                 res.status(200).json({"status":"success"})
                            }
                          }
                   })
               }
                
            }
        })
        
    }
    catch (error) {
        console.log(error)
    }
    
})

router.get("/digitalauditionplatform/:id",Authenticated,(req,res)=>{
    
    Audition.findById(req.params.id,(err,audition)=>{
        if(err){
            return res.render("dap",{audition})
        }else{
            if(audition.auditionCharges > 0){
            var data = JSON.stringify({"tx_ref":`${uuidv4()}`,"amount":`${audition.auditionPrice}`,"currency":"NGN","redirect_url":`https://oliveoive.herokuapp.com/paidaudition?audition=${audition._id}&provider=${audition.provider}&user=${req.session.user._id}`,"payment_options":"card","meta":{"consumer_id":`${audition.provider}`,"consumer_mac":`${audition.provider}`},"customer":{'email':`user@gmail.com`,"phonenumber":`${req.session.user.username}`,"name":`${req.session.user._id}`},"customizations":{"title":"Olive Auditions","description":`pay for your ${audition.auditionName} audition`,"logo":"https://assets.piedpiper.com/logo.png"}});

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
                res.render("audition",{audition,user:req.session.user})

            }


        }
        
    })
})

router.post("/check",Authenticated,(req,res)=>{
    const {id} = req.body;
    Audition.findById(id,(err,audition)=>{
        if(err){
            res.send({"status":"error"})
        }else{
            if(audition.auditionCharges > 0){
                res.send({"status":"paid"})
            }else{
                res.send({"status":audition._id})
            }
        }
    })
})



router.get("/paidaudition",Authenticated,(req,res)=>{
    const {audition,provider,user} = req.query
    console.log(audition,provider,user)
    Payment.findOne({user:user},(err,payment)=>{
        if(err){
            console.log("err finding payment ref")
            return res.redirect("/digitalauditionplatform")
        }else{
            if(payment.paymentStatus == "successful"){
                
                            
                                Audition.findById(audition,(err,audition)=>{
                                            if(err){
                                                console.log("err finding audition")
                                                return res.redirect("/digitalauditionplatform")
                                            }else{
                                                // audition
                                                Payment.create({
                                                        user:req.session.user._id,
                                                        provider:req.query.provider,
                                                        amount:audition.auditionPrice,
                                                        auditionName:audition.auditionName,
                                                        auditionId:audition._id,
                                                        paymentRef:req.query.tx_ref,
                                                        paymentStatus:req.query.status,
                                                                },(err,payment)=>{
                                                                    res.render("audition",{audition,user})
                                                                })

                                            }
                                        })
                   
            }else{
                return res.redirect("/digitalauditionplatform")
            }
              
        }
          

    })
})
   
    // Audition.findById(req.query.audition,(err,audition)=>{
    //     if(err){
    //         console.log(err)
    //     }else{
    //         if(req.query.status === "successful"){
    //             Paymment.create({
    //                 user:req.query.user,
    //                 provider:req.query.provider,
    //                 amount:audition.auditionPrice,
    //                 auditionName:audition.auditionName,
    //                 auditionId:audition._id,
    //                 paymentRef:req.query.tx_ref,
    //                 paymentStatus:req.query.status,
    //             },(err,payment)=>{
                    
    //                 if(err){
    //                     console.log(err)
    //                 }else{
    //                     if(payment.paymentStatus === "successful"){
    //                         res.render("audition",{audition})
    //                     }else{
    //                         res.redirect('/')
    //                     }
    //                 }
    //             })
    //         }else{
    //             res.redirect("/digitalauditionplatform")
    //         }
    //     }
        
    //     }
        
    // )
    


router.post("/paid",Authenticated,async (req,res)=>{
    const {data,user,audition} = req.body;
   console.log(req.session.user._id)
   
    const getAuditionDetails = await Audition.findById(audition)
    console.log(getAuditionDetails)
    
    // create payment
    Payment.create({
        user:user,
        provider:getAuditionDetails.provider,
        amount:data.amount,
        paymentRef:data.tx_ref,
        paymentStatus:data.status,
        auditionId:audition,
    },(err,payment)=>{
        if(err){
            console.log(err)
        }else{
            if(payment.paymentStatus === "successful"){
                res.send({"status":{"success":payment.paymentRef}})
            }else{
                res.send({"status":"failed"})
            }
        }
    })

})

router.get("/payment/success",Authenticated,(req,res)=>{
    Payment.findOne({user:req.session.user._id},(err,payment)=>{
        if(err){
            console.log(err)
        }else{
            if(payment){
                Audition.findById(payment.auditionId,(err,audition)=>{
                    if(err){
                        console.log(err)
                    }else{
                        if(audition){
                            res.render("success",{audition,user:req.session.user})
                        }else{
                            res.redirect("/digitalauditionplatform")
                        }
                    }
                })
                
            }else{
                res.redirect("/digitalauditionplatform")
            }
        }
    })
})

// site count

// sucessful payment

// free
router.post("/free",Authenticated,(req,res)=>{
    const {user,audition} = req.body;
    // find Audition
    Audition.findById(audition,(err,audition)=>{
        if(err){
            console.log(err)
        }else{
            // create free payment
            Payment.create({
                user:user,
                provider:audition.provider,
                amount:0,
                paymentRef:"free",
                paymentStatus:"successful",
                auditionId:audition,
            },(err,payment)=>{
                if(err){
                    console.log(err)
                }else{
                    res.send({"status":payment.auditionId})
                }
            })
    }

        })


})


router.get("/auditionlink/",(req,res)=>{
    console.log(req.query.auditionId)
    Audition.findById(req.query.auditionId,(err,audition)=>{
        if(err){
            return res.render("error")
        }else{
            if(audition){
                // res.render(template to render #should be form , store the formdata to the database as new user #should be post request to /auditionlink  {audition data to be passed to the template, #auditionname & #auditionid & auditionprice})
                res.render("register",{audition})
            }else{
                res.send({"error":"No audition links"})
            }
        }
    })


})


router.get("/auditionlink/success/",LinkAuthenticated,(req,res)=>{
    const auditionId = req.query.auditionId;
    const user = req.session.user._id;
    console.log(auditionId)
    Audition.findById(auditionId,(err,audition)=>{
        if(err){
            return res.render("error")
        }else{
            if(audition){
                res.render("regSuccess",{audition,user})
            }else{
                res.send({"error":"No audition links"})
            }
        }
    })
})


router.post("/auditionlink",(req,res)=>{
    const {username,email,password,auditionId,name} = req.body;
   
    User.findOne({username},(err,user)=>{
        if(err){
            console.log(err.message.code)
        }else{
            if(user){
                if(user.email === email){
                 return res.send({"message":"User already exists"})
                }else{
                   return res.send({"message":"User already exists"})
                }
            }else{
                const hash = bcrypt.hashSync(password,10);
                User.create({
                    username,
                    password:hash,
                    email,
                    name,
                    role:"user",
                    roleId:"1",
                    otp:otp
                },(err,user)=>{

                    if(err){
                        console.log(err.message)
                        // get the error code
                        if(err.code === 11000){
                             res.send({"message":"User already exists"})
                        }
                    }else{
                        if(user){
                            req.session.LinkAuthenticated = true;
                            req.session.user = user;
                            req.session.userIsLoggedIn = true;
                            const request = mailjet
                            .post("send", {'version': 'v3.1'})
                            .request({
                              "Messages":[
                                {
                                  "From": {
                                    "Email": "koredebada@gmail.com",
                                    "Name": "Ghenghen Team"
                                  },
                                  "To": [
                                    {
                                      "Email": email,
                                      "Name": name
                                    }
                                  ],
                                  "Subject": "Welcome to Ghenghen",
                                  "TextPart": `Hi ${name}\n,Welcome to Ghenghen your OTP is ${otp} \n Thanks for Joining Olive\n Best regard \n Ghenghen Team`,
                               
                             
                                  "HTMLPart": ``,
                                  "CustomID": "AppGettingStartedTest"
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
        
                                 const config = {
                                method: 'get',
                                url: `https://1960sms.com/api/send/?user=${process.env.textMsgUser}&pass=${process.env.textMsgPass}&to=${username}&from=hello&msg= ${name}your Ghenghen registration OTP:${otp}`,
                                headers: { }
                            };
                            
                            axios(config)
                            .then(function (response) {
                                console.log(JSON.stringify(response.data));
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                            //aync find audition
                            Audition.findById(auditionId,(err,audition)=>{
                                if(err){
                                    console.log(err)
                                }else{
                                    if(audition){
                                        if(audition.auditionCharges > 0){
                                            const details = {
                                                user:user._id,
                                                provider:audition.provider,
                                                amount:audition.auditionPrice,
                                                auditionName:audition.auditionName,
                                                auditionId:audition._id,
                                                paymentRef:uuidv4(),
                                            }
                                           
                                            res.send({"pay":details})
                                        }else{
                                            Payment.create({
                                                user:user._id,
                                                provider:audition.provider,
                                                amount:0,
                                                auditionName:audition.auditionName,
                                                auditionId:audition._id,
                                                paymentRef:uuidv4(),
                                                paymentStatus:"free",
                                            },(err,payment)=>{
                                                if(err){
                                                    console.log(err)
                                                }else{
                                                    res.send({"paid":false})
                                                }
                                            })
                                            
                                        }
                                    }else{
                                        res.send({"message":"No audition links"})
                                    }
                                }
                            })

                        }
                    }
                })       
            }
        }
    })
})


router.get("/auditionlink/payment",LinkAuthenticated,(req,res)=>{
    const {auditionId,user} = req.query;
    // console.log(auditionId,user)
    Audition.findById(auditionId,(err,audition)=>{
        if(err){
            console.log(err)
        }else{
            if(audition){
                // find user
                User.findById(user,(err,user)=>{
                    if(err){
                        console.log(err)
                    }else{
                        if(user){
                            if(audition.auditionCharges > 0){
                                res.render("payment",{audition,user})
                            }else{
                                res.redirect(`/auditionlink/success/?auditionId=${auditionId}`)
                            }
                        }else{
                            res.send({"error":"No user"})
                        }
                    }
                })
            }else{
                res.redirect("/")

            }
        }
    })   
    
})

    // res.send({"status":req.body})

    // upload a video with multer
    // upload video

router.post("/uploadvideo",Authenticated,videoUpload.single('video'),async(req,res)=>{
    const {user,audition,videoUrl,provider} = req.body;
    // upload video to cloudinary with try catch
    console.log(req.file)
    try{
        const result = await cloudinary.uploader.upload(req.file.path,{resource_type:"video",overwrite:true,folder:"videos"})
        // create video
        console.log(result)
        Video.create({
            user,
            provider,
            url:result.url,
            audition
        },(err,video)=>{
            if(err){
                console.log(err)
            }else{
                if(video){
                    res.send({"status":"success"})
                    fs.unlink(req.file.path,(err)=>{
                        if(err){
                            console.log(err)
                        }else{
                            console.log("file deleted")
                        }
                    })
                }else{
                    res.send({"status":"error"})
                }
                // delete video from server
               
            }
        })
    }catch(err){
        console.log(err)
    }
})

router.post("/dateselection",(req,res)=>{
    const {date,user,audition,provider} = req.body;
    console.log(req.body)
    // aggregrate dateSelection limit to 100
    DateSelection.aggregate([
        {
            $match:{
                date,
            }
        },
        {
            $group:{
                _id:{
                    user:"$user",
                    provider:"$provider",
                    audition:"$audition"
                },
                count:{
                    $sum:1
                }
            }
        }
    ],(err,result)=>{
        if(err){
            console.log(err)
        }else{
            console.log(result)
            if(result.length === 100){
                res.send({"status":"limit"})
            }else{
                DateSelection.create({
                    user,
                    provider,
                    audition,
                    date,
                    selected:"true"
                },(err,dateSelection)=>{
                    if(err){
                        console.log(err)
                    }else{
                        if(dateSelection){
                            console.log(dateSelection)
                            res.send({"status":"success"})
                        }else{
                            res.send({"status":"error"})
                        }
                    }
                })
            }
        }
    })
})

   
    // res.send({"status":"success"})

    // save url from cloudinary to the database
    // try{
    // const url = await cloudinary.uploader.upload(req.file.path) 
    // console.log(url)
    // // create new video
    // Video.create({
    //     user,
    //     provider,
    //     videoUrl:url.url,
        
    //     auditionId:audition
    // },(err,video)=>{
    //     if(err){
    //         console.log(err)
    //     }else{
    //         if(video){
    //             res.send({"status":"success"})
    //         }else{
    //             res.send({"status":"failed"})
    //         }
    //     }
    // })
    // }catch(err){
    //     console.log(err.message)
    // }

  
    // remove string from user and audition and replace with object id
    // const userId = user.replace(/\"/g,"");
    // const auditionId = audition.replace(/\"/g,"");
    // const providerId = provider.replace(/\"/g,"");


    // check if file 
    // if(req.file){
    //     const file = req.file;
    //     // 
    // if(req.file.mimetype.split("/")[0] === "video"){
    //     // upload video to cloudinary
    //     cloudinary.uploader.upload(file.path,(result)=>{
    //         if(result){
    //             // find user and audition and provider
    //             // create video
    //             Video.create({
                    
    //                 url:result.url,
                    
    //             },(err,video)=>{ 
    //                 if(err){
    //                     console.log(err)
    //                 }else{
    //                     if(video){
    //                         res.send({"status":"success"})
    //                         //  delete file from server
    //                         fs.unlink(file.path,(err)=>{
    //                             if(err){
    //                                 console.log(err)
    //                             }
    //                         })
    //                     }else{
    //                         res.send({"status":"fail"})
    //                     }
    //                 }
    //             })
    //         }
    //     })
    // }else{
    //     res.send({"status":"fail"})
    // }
    // }else{
    //     res.send({"status":"fail"})
    // }
// })
    // const fileName = `${uuidv4()}.mp4`;
    // const filePath = `${__dirname}/../../public/uploads/${req.file.filename}`;
    // const fileStream = fs.createWriteStream(filePath);
    // fileStream.on('error',(err)=>{
    //     console.log(err)
    // })
    // fileStream.on('finish',()=>{
    //     // upload to cloudinary
    //     cloudinary.uploader.upload(filePath,(result)=>{
    //         if(result){
    //             // delete file
    //             fs.unlink(filePath,(err)=>{
    //                 if(err){
    //                     console.log(err)
    //                 }else{
    //                     // create video
    //                     Video.create({
    //                         user,
    //                         video:result.url,
    //                         provider,
    //                         audition
    //                     },(err,video)=>{
    //                         if(err){
    //                             console.log(err)
    //                         }else{
    //                             if(video){
    //                                 res.send({"message":"Video uploaded"})
    //                             }else{
    //                                 res.send({"error":"Video not uploaded"})
    //                             }
    //                         }
    //                     })
    //                 }
    //             })
    //         }else{
    //             res.send({"error":"Video not uploaded"})
    //         }
    //     })
    // })
    // fileStream.end(file.buffer)
    // }else{
    //     res.send({"error":"Invalid file type"})
    // }
    // }else{
    //     res.send({"error":"No file"})
    // }


    router.get("/testemail",(req,res)=>{
        
        const request = mailjet
        .post("send", {'version': 'v3.1'})
        .request({
          "Messages":[
            {
              "From": {
                "Email": "badasulaimon@gmail.com",
                "Name": "Ghenghen Team"
              },
              "To": [
                {
                  "Email": 'koredebada@gmail.com',
                  
                }
              ],
              "Subject": "Welcome to Ghenghen",
              "TextPart": `Hi hi \n,Welcome to Ghenghen your OTP is  \n Thanks for Joining Olive\n Best regard \n Ghenghen Team`,
           
         
              "HTMLPart": `
                
              `,
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
          res.send({"status":"success"})
    })


// router logout

router.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/")
})

router.get("/recovery",(req,res)=>{
    res.render("recover")
})
router.post("/recovery",(req,res)=>{
    const {name,email} = req.body;
    User.findOne({email},(err,user)=>{
        // send link to reset user password to mailjet
        if(err){
            console.log(err)
        }
        if(user){
            const token = jwt.sign({
                name,
                email
            },"secret",{expiresIn:"1h"})
            console.log(token)
            const link = `http://localhost:1200/reset/${token}`
            const request = mailjet.post("send", {'version': 'v3.1'})
            .request({
                "Messages":[
                    {
                        "From": {
                            "Email": "koredebada@gmail.com",
                            "Name": "Ghenghen Team"
                        },
                        "To": [
                            {
                                "Email": email,
                                "Name": "Ghenghen Team"
                            }],
                            "Subject": "Reset your Password",
                            "TextPart": "Reset your password with the link below",
                            "HTMLPart": `<h3>Reset your password with the link below <a style="background-color:"goldenrod" href=${link}>reset password</a></h3>`,
                        }]
                    }) .then((result) => {
                        console.log(result.body)
                    })
                    .catch((err) => {
                        console.log(err.statusCode)
                    })
                                
        }else{
            res.send({"status":"fail"})
        }
    })
})

// router for reset password
router.get("/reset/:token",(req,res)=>{
    const {token} = req.params;
    jwt.verify(token,"secret",(err,decoded)=>{
        if(err){
            console.log(err)
        }else{
            console.log(decoded)
            // set token to session
            req.session.token = token;
            res.render("reset",{token})
        }
    })
})


// router reset password
router.post("/reset/:token",(req,res)=>{
    const {token} = req.params;
    const {password} = req.body;
    jwt.verify(token,"secret",(err,decoded)=>{
        if(err){
            res.send({"status":"fail"})
        }else{
            const {name,email} = decoded;
            // find by email and update password and hash and remove token
            const hash = bcrypt.hashSync(password,10);
            User.findOneAndUpdate({email},{password:hash},(err,user)=>{
                if(err){
                    console.log(err)
                }else{
                    if(user){
                        res.send({"status":"success"})
                        // delete token from session
                        req.session.token = null;
                        
                    }else{
                        res.send({"status":"fail"})
                    }
                }
            })
            
            

        }
    })
})










module.exports = router;
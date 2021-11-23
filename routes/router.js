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
const upload = require("../utils/multer")


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



router.get("/",(req,res)=>{
    res.render("auth")
})








router.post("/",(req,res)=>{
    const {username,password,email,name} = req.body
    // nodeMailer.sendMail({
    //     from: "koredebda@gmail.com",
    //     to: email,
    //     subject: "Welcome to Olive",
    //     text: `Hi ${name},\n\nWelcome to Olive.\n\nYour OTP is ${otp}.\n\nThank you for choosing Olive.\n\nRegards,\nOlive Team`
    // })
    transporter.sendMail({
        from: "koredebada@gmail.com",
        to: email,
        subject: "Welcome to Olive",
        text: `Hi ${name},\n\nWelcome to Olive.\n\nYour OTP is ${otp}.\n\nThank you for choosing Olive.\n\nRegards,\nOlive Team`
    })
    .then(()=>{
        console.log("email sent")
    })
    .catch(err=>{
        console.log(err)
    })


    try {
        User.findOne({username},(err,user)=>{
            if(user){
                res.send({"error":"User already exists"})
            }else{
                const newUser = new User({
                    username,
                    password,
                    email,
                    name,
                    role:"user",
                    roleId:"1",
                    otp:otp
                })
                newUser.save((err,user)=>{
                    req.session.user = user
                    // globals.set('userId', user._id, {protected: true});
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
            res.render("dap",{auditions,user:req.session.user})
        }
    })

    
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

router.patch("/profile/:id",Authenticated,upload.single('logo'),async(req,res)=>{
    const {username,password,email} = req.body
    
    const id = req.params.id
    console.log
    const result = await cloudinary.uploader.upload(req.file.path) 
    User.findByIdAndUpdate(id,{username,password,email,Image:result.secure_url,},(err,user)=>{
        if(err){
            res.send({"error":"Error in updating profile"})
        }else{
            req.session.user = user
            res.send({"status":"success"})
        }
    })
})


router.get("/auditions",Authenticated,(req,res)=>{
    // find user in Payment collection    
    res.render("userAuditions")
    
})

router.post("/digitalauditionplatform",Authenticated,(req,res)=>{
    const {auditionId,user} = req.body
    // push uadition to
    console.log(auditionId,user)
    try {
        Audition.findById(auditionId,(err,audition)=>{
            if(err){
                console.log(err)
            }else{
                // push audition to participants auditionDetails array
                Participants.findOneAndUpdate({user},{$push:{auditionDetails:{auditionId,audition}}},(err,participant)=>{
                    if(err){
                        console.log(err)
                    }else{
                        res.send({"status":"success"})
                    }
                })
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

    console.log(id)

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
                                                res.render("audition",{audition,user})
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
    


router.post("/paid",Authenticated,(req,res)=>{
    const {data,user,audition} = req.body;
    console.log(data,user,audition)
    // create payment
    Payment.create({
        user:user,
        provider:audition,
        amount:data.amount,
        paymentRef:data.tx_ref,
        paymentStatus:data.status,
        auditionId:audition
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

// site count


router.get("/auditionlink",(req,res)=>{
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





router.post("/auditionlink",(req,res)=>{
    const {username,email,password,auditionId,name} = req.body;
    console.log(password)
    User.findOne({username},(err,user)=>{
        if(err){
            console.log(err)
        }else{
            if(user){
                res.send({"message":"User already exists"})
            }else{
                User.create({
                    username,
                    password,
                    email,
                    name,
                    role:"user",
                    roleId:"1",
                    otp:otp
                },(err,user)=>{

                    if(err){
                        console.log(err)
                    }else{
                        if(user){
                            req.session.LinkAuthenticated = true;
                            req.session.user = user;
                            req.session.userIsLoggedIn = true;
                            transporter.sendMail({
                                from: "koredebada@gmail.com",
                                to: email,
                                subject: "Welcome to Olive",
                                text: `Hi ${name},\n\nWelcome to Olive.\n\nYour Registration was successful.\n\nThank you for choosing Olive.\n\nRegards,\nOlive Team`
                            })
                            .then(()=>{
                                console.log("email sent")
                            })
                            .catch(err=>{
                                console.log(err)
                            })
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
    console.log(auditionId,user)
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
                                res.redirect("/digitalauditionplatform/auditionId")
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



// router logout

router.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/")
})












module.exports = router;
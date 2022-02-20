const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Payment = require("../models/payment");
const globals = require('node-global-storage');
const Provider = require("../models/provider");



module.exports.requireAuth = async (req,res,next)=>{
    const token = req.cookies.jwt;
  if(token){
      jwt.verify(token,process.env.JWTSECRET, async (err,decodedToken) => {
          if(err){
                // res.locals.user = null
              res.redirect("/")
          }else{
            globals.set('id',decodedToken.id, {protected: true});
            // const user = await User.findById(id);
            // res.locals.user = user
            next()
          }
      });
  }else{
      res.redirect("/") 
  }
}

module.exports.Auth = async (req,res,next)=>{
    const isAuth = req.session.isLoggedIn;
  if(isAuth === true){
    next()
  }else{
      res.redirect("/provider") 
  }
}
module.exports.Authenticated = async (req,res,next)=>{
    const Authenticated = req.session.userIsLoggedIn;
  if(Authenticated === true){
    next()
  }else{
      res.redirect("/") 
  }
}
module.exports.LinkAuthenticated = async (req,res,next)=>{
    const LinkAuthenticated = req.session.LinkAuthenticated;
  if(LinkAuthenticated === true){
    next()
  }else{
      res.redirect("/") 
  }
}

// // check if user is in payment
// module.exports.checkPayment = async (req,res,next)=>{
//     // const id = globals.get('id');
//     const user = await User.findById(req.session.userId);
//     const payment = await Payment.findOne({user: user._id});
//     if(payment){
//         next()
//     }else{
//         res.redirect("/payment")
//     }
// }








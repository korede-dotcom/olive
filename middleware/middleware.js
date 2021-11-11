const jwt = require("jsonwebtoken");
const User = require("../models/user");
const globals = require('node-global-storage');



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








const jwt = require("jsonwebtoken");
const User = require("../models/user");
const globals = require('node-global-storage');

const providerAuth = (req,res,next)=>{
    const providertoken = req.cookies.providerjwt;
  if(providertoken){
      jwt.verify(token,process.env.providerJWTSECRET, async (err,decodedToken) => {
          if(err){
              res.redirect("/")
          }else{
            globals.set('providerId',decodedToken.id, {protected: true});
            // const user = await User.findById(id);
            // res.locals.user = user
            next()
          }
      });
  }else{
      res.redirect("/") 
  }
}

module.exports = providerAuth
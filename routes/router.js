const express = require("express");
const router = express.Router();
const axios = require("axios")




router.get("/",(req,res)=>{
    res.render("auth")
})
router.get("/dashboard",(req,res)=>{
    res.render("dashboard")
})
router.get("/digitalauditionplatform",(req,res)=>{
    res.render("dap")
})

router.get("/digitalauditionplatform/:name",(req,res)=>{
    axios.get('https://streamyard.com/gc3vxdzgvm')
  .then(function (response) {
   
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
    req.params.name === "bbnaija" && res.render("bbn")
  
})












module.exports = router;
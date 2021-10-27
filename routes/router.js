const express = require("express");
const router = express.Router();




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
    req.params.name === "bbnaija" && res.render("bbn")
  
})












module.exports = router;
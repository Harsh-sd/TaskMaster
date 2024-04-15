const express=require("express");
const router=express.Router();
const session = require("express-session");
const userController=require("../controllers/User");
const passport=require("passport");
router.post("/signup" ,userController.signup);
router.post('/login', passport.authenticate('local',{session:true ,  failureRedirect: '/login' }),userController.login);
module.exports=router;
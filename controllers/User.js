const User=require("../models/User");
const bcrypt =require("bcrypt");
const jwt=require("jsonwebtoken");
exports.signup=async (req,res)=> {
    try {
        const email=req.body.email;
const password=req.body.password;
const username=req.body.username;
const olduser=await User.findOne({email:email});
if(olduser){
res.status(422).send({message:"User with this email already exists"});
};
const hashPassword=await bcrypt.hash(password , 12);
const user=new User({
    email:email,
    password:hashPassword,
    username:username

});
const savedUser=await user.save();
res.status(201).send({message :"User signup efficiently" , user:savedUser});
    } catch (error) {
        
        console.log(error);
    }

};
exports.login=async (req,res)=> {
    try {
        const email=req.body.email;
        const password=req.body.password;
const user= await User.findOne({email:email});
        const token= jwt.sign({id:user._id} , "my-secret" , {expiresIn:"1y"})
        res.send(200).send({message:"login successfully" , token:token});
    } catch (error) {
       
        console.log(error);
    }
}
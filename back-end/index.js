const express = require("express");
const app = express();
const jwt=require("jsonwebtoken")
require("dotenv").config();
const cors=require("cors");
const bcrypt=require("bcrypt");
const mdb = require("mongoose");
const dotenv = require("dotenv");
const Signup = require("./models/SignupScheme.js");
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const port = process.env.PORT || 3000;
dotenv.config();
console.log(process.env.MONGODB_URL);
mdb
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDB CONECTED");
  })
  .catch((err) => {
    console.log("Check your connection String", err);
  });

  app.post("/Signup",async(req,res)=>{
    try{
        const {firstName,lastName,email,password,phoneNumber}=req.body;
        console.log(firstName);
        console.log(lastName);
        console.log(email);
        console.log(password);
        console.log(phoneNumber);
        const hashedPassword = await bcrypt.hash(password, 10);
        const newSignup=new Signup({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            phoneNumber
        });
        newSignup.save();
        res.status(201).json({message:"Signup Successfulll",isSignup:true});

        console.log("Signup Successefull");
    }catch(e){
        console.log(e);
    }
  });

  app.post("/Login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Signup.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ message: "user not found", isLogin: false });
      }
      const payload={
        firstname:user.firstName,
        email:user.email
      }
      const secretKey = process.env.SECRET_KEY || "default_secret_key";
      const token=jwt.sign(payload,secretKey,{expiresIn:"10m"})
      console.log(token)
      const validpassword = await bcrypt.compare(password, user.password);
      console.log(validpassword);
      if (!validpassword) {
        return res
          .status(401)
          .json({ message: "Invalid Password", isLogin: false });
      }
   
    
      console.log("login successfull");
      res.status(200).json({ message: "Login Successful", isLogin: true , token:token });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Error", isLogin: false });
    }
  });
  
app.get("/", (req, res) => {
    res.send("WELCOME");
  });
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });

  
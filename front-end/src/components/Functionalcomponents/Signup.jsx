import "../css/Signup.css"
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

import { Link, Navigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [firstName,setFN]=useState("");
  const [lastName,setLN]=useState("");
  const [email,setEmail]=useState("");
  const [password,setpass]=useState("");
  const [phoneNumber,setphone]=useState(0);

  
  const handleSignup=async(e)=>{
    e.preventDefault()

    try{
    const res= await axios.post("https://kanban-board-fjzt.vercel.app/signup",{
      firstName,lastName,email,password,phoneNumber
    });

    if(res.status==201){
      console.log("Succedd")
      alert("Sign up Sucessfull");
      
      navigate("/")
    }
    else{
      alert("Sign up Failed");
    }


  }catch(e){
    if (e.response && e.response.status === 409) {
      alert("User already exists. Please log in.");
      navigate('/login')
    }else{
    console.error("Error:", e);
    alert("An error occurred. Please check your details and try again.");
    }
  }
    
  }

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Signup for Kanban</h2>
        <form>
          <div className="input-group">
            <label htmlFor="firstName">First Name</label>
            <input type="text" id="firstName" placeholder="Enter your name" value={firstName} onChange={e=>{setFN(e.target.value)}} required />
          </div>
          <div className="input-group">
            <label htmlFor="lastName">First Name</label>
            <input type="text" id="lastName" placeholder="Enter your lastname" value={lastName} onChange={e=>{setLN(e.target.value)}} required />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" value={email} onChange={e=>{setEmail(e.target.value)}} required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Create a password" value={password} onChange={e=>{setpass(e.target.value)}} required />
          </div>

          <div className="input-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input type="number" placeholder="Enter the Phone Number" value={phoneNumber} onChange={e=>{setphone(e.target.value)}} required />
          </div>

          <button type="submit" className="signup-btn" onClick={handleSignup} >Signup</button>
        </form>
        <div>
            <h3>Existing User <Link to="/">Login</Link></h3>
        </div>
      </div>
    </div>
  );
};

export default Signup;

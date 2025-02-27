import React, { useState } from "react";
import "../css/Login.css";
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";



const Login = () => {

  const navigate=useNavigate();

  const [email,setEmail]=useState("");
  const [password,setpass]=useState("");

  const handleLogin=async(e)=>{
    e.preventDefault();
    const res=await axios.post("https://kanban-board-z99a.onrender.com/login",{
      email,password
    })

    if(res.status==201){
      alert("Login Sucessfull")
      
      console.log("Login Successfull")
      navigate("/dragdrop");

 
    }

  }
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login to Kanban</h2>
        <form>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter email" value={email} onChange={e=>{setEmail(e.target.value)}} required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter password" value={password} onChange={e=>{setpass(e.target.value)}} required />
          </div>

          <button type="submit"  className="login-btn" onClick={handleLogin}>Login</button>
        </form>
        <div>
            <h3>New User? <Link to="/signup">Signup</Link></h3>
            
        </div>
        
      </div>
    </div>
  );
};

export default Login;

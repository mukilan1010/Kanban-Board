import React, { useState } from "react";
import "../css/Login.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../App";


const Login = () => {
  const navigate = useNavigate();
  const { userDetail, setUserDetail } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setpass] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("https://kanban-board-z99a.onrender.com/Login", {
        email,
        password,
      });

      if (res.status === 200) {
        setUserDetail(email);
        // Store token & user data in localStorage
        localStorage.setItem("email", email);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        alert("Login Successful");
        console.log("Login Successful");

        // Redirect user after successful login
        navigate("/dragdrop");
      }
    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        if (error.response.status === 404) {
          alert("User not found. Please register first.");
        } else if (error.response.status === 401) {
          alert("Invalid email or password.");
        } else {
          alert(`Error: ${error.response.data.message || "Something went wrong"}`);
        }
      } else {
        alert("Unable to connect to the server. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login to Kanban</h2>
        <form>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setpass(e.target.value);
              }}
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className={`login-btn ${isLoading ? 'loading' : ''}`} 
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <div>
          <h3>
            New User? <Link to="/signup">Signup</Link>
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState, useEffect } from "react";
 import "../css/Profile.css";
 import axios from 'axios';
 import { Link, useNavigate } from "react-router-dom";
 import { FaUser, FaEnvelope, FaPhone, FaArrowLeft, FaSignOutAlt } from "react-icons/fa";
 
 import { useContext } from "react";
 import { UserContext } from "../../App";
 const Profile = () => {
   const navigate = useNavigate();
   const [userProfile, setUserProfile] = useState({
     firstName: "",
     lastName: "",
     email: "",
     phoneNumber: ""
   });
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
 
   useEffect(() => {
     const fetchUserProfile = async () => {
       try {
         const token = localStorage.getItem('token');
         if (!token) {
           setError("You need to login first");
           setLoading(false);
           return;
         }
         const response = await axios.get('https://kanban-board-fjzt.vercel.app/profile', {
           headers: { Authorization: `Bearer ${token}` }
         });
         setUserProfile(response.data);
         setLoading(false);
       } catch (err) {
         console.error("Failed to fetch profile data:", err);
         setError("Failed to load profile data. Please try again later.");
         setLoading(false);
       }
     };
 
     fetchUserProfile();
   }, []);
 
   const handleBackToTasks = () => {
     navigate('/dragdrop');
   };
 
   const handleLogout = () => {
     // Clear the authentication token
    
     localStorage.removeItem("token");
     // Navigate to login page
  
     navigate('/');
   };
 
   if (loading) {
     return (
       <div className="user-profile-container">
         <div className="user-profile-card">
           <h2>Loading profile...</h2>
         </div>
       </div>
     );
   }
 
   if (error) {
     return (
       <div className="user-profile-container">
         <div className="user-profile-card">
           <h2>Error</h2>
           <p>{error}</p>
           <button onClick={handleBackToTasks} className="navigate-back-button">
             <FaArrowLeft /> Back to Tasks
           </button>
         </div>
       </div>
     );
   }
 
   return (
     <div className="user-profile-container">
       <div className="user-profile-card">
         <div className="user-profile-header">
           <h2>My Profile</h2>
           <div className="header-buttons">
             <button onClick={handleBackToTasks} className="navigate-back-button">
               <FaArrowLeft /> Back to Tasks
             </button>
             <button onClick={handleLogout} className="logout-button">
               <FaSignOutAlt /> Logout
             </button>
           </div>
         </div>
         <div className="user-avatar-section">
           <div className="user-avatar-circle">
             {userProfile.firstName && userProfile.firstName[0].toUpperCase()}
             {userProfile.lastName && userProfile.lastName[0].toUpperCase()}
           </div>
         </div>
         <div className="user-profile-details">
           <div className="user-profile-item">
             <FaUser className="user-profile-icon" />
             <div className="user-profile-info">
               <label>Name</label>
               <p>{userProfile.firstName} {userProfile.lastName}</p>
             </div>
           </div>
           <div className="user-profile-item">
             <FaEnvelope className="user-profile-icon" />
             <div className="user-profile-info">
               <label>Email</label>
               <p>{userProfile.email}</p>
             </div>
           </div>
           <div className="user-profile-item">
             <FaPhone className="user-profile-icon" />
             <div className="user-profile-info">
               <label>Phone Number</label>
               <p>{userProfile.phoneNumber}</p>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 };

 export default Profile;

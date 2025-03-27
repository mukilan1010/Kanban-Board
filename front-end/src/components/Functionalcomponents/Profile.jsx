import React, { useState, useEffect } from "react";
import "../css/Profile.css";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaArrowLeft, 
  FaSignOutAlt, 
  FaImage 
} from "react-icons/fa";

const Profile = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    profileImage: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

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
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUserProfile(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
        setError(err.response?.data?.error || "Failed to load profile data. Please try again later.");
        setLoading(false);
      }
    };
  
    fetchUserProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        alert("Only JPEG, PNG, and GIF files are allowed.");
        return;
      }

      if (file.size > maxSize) {
        alert("File size should be less than 5MB.");
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      alert("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('email', userProfile.email);

    try {
      const response = await axios.post('https://kanban-board-fjzt.vercel.app/upload-profile-image', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update user profile with new image URL
      setUserProfile(prev => ({
        ...prev,
        profileImage: response.data.imageUrl
      }));

      // Clear file input
      setImageFile(null);
      setPreviewImage(null);
      alert("Profile image uploaded successfully!");
    } catch (err) {
      console.log(err.response ? err.response.data : err);
      console.error("Failed to upload image:", err.response ? err.response.data : err);
      alert(err.response?.data?.message || "Failed to upload image. Please try again.");
    }
  };

  const handleBackToTasks = () => {
    navigate('/dragdrop');
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
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
            {userProfile.profileImage ? (
              <img 
                src={userProfile.profileImage} 
                alt="Profile" 
                className="user-avatar-image"
              />
            ) : previewImage ? (
              <img 
                src={previewImage} 
                alt="Preview" 
                className="user-avatar-image"
              />
            ) : (
              <>
                {userProfile.firstName && userProfile.firstName[0].toUpperCase()}
                {userProfile.lastName && userProfile.lastName[0].toUpperCase()}
              </>
            )}
          </div>
          <div className="image-upload-controls">
            <input 
              type="file" 
              id="profile-image-upload"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="profile-image-upload" className="upload-image-button">
              <FaImage /> Choose Image
            </label>
            {imageFile && (
              <button onClick={handleImageUpload} className="upload-confirm-button">
                Upload Image
              </button>
            )}
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
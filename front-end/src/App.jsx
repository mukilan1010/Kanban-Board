import { useState, createContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Functionalcomponents/Login';
import Signup from './components/Functionalcomponents/Signup';
import DragDrop from './components/Functionalcomponents/DragDrop';
import Profile from './components/Functionalcomponents/Profile';
import { ToastContainer } from 'react-toastify';

export const UserContext = createContext();

function App() {
  const [userDetail, setUserDetail] = useState(null);

  return (
    <UserContext.Provider value={{ userDetail, setUserDetail }}>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Login />} />
          <Route path="/dragdrop" element={<DragDrop />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </UserContext.Provider>
  );
}

export default App;

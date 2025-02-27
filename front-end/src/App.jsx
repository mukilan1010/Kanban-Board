import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css';
import Login from './components/Functionalcomponents/Login';
import NavBar from './components/Functionalcomponents/NavBar';
import Signup from './components/Functionalcomponents/Signup';
import{BrowserRouter,Routes,Route} from "react-router-dom";


function App() {
 

  return (

    <main>
      <BrowserRouter>
      <NavBar/>
      <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      </Routes>
      </BrowserRouter>
    </main>
  )
}

export default App

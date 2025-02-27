import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css';
import Login from './components/Functionalcomponents/Login';
import NavBar from './components/Functionalcomponents/NavBar';
import Signup from './components/Functionalcomponents/Signup';
import{BrowserRouter,Routes,Route} from "react-router-dom";
import DragDrop from './components/Functionalcomponents/DragDrop';


function App() {
 

  return (

    <main>
      {/* <DragDrop/> */}
      
      <BrowserRouter>
      <NavBar/>
      <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dragdrop" element={<DragDrop />} />

      </Routes>
      </BrowserRouter>
    </main>
  )
}

export default App

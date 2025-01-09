import React from 'react';
import { Routes, Route, NavLink } from "react-router-dom";
import { SignUp } from './pages/SignUp';
import { SignUpOneBtcClub } from './pages/SignUpOneBtcClub';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { AddBtcProfile } from './pages/AddBtcProfile';
import './App.css';

function App() {
  return (
    <div className='main-container'>
      <div className='nav'>
        <img 
          className='nav-img'
          ////Will update with right icon later
          src="https://c8.alamy.com/comp/T2B0HY/bitcoin-atm-machine-T2B0HY.jpg" 
          alt="Bitcoin Logo" 
        />
        <div className='menu-items'>
          <NavLink 
            className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
            to="/"
          >
            Home
          </NavLink>
          <NavLink 
            className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
            to="/signup"
          >
            Btc Machine
          </NavLink>
          <NavLink 
            className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
            to="/one-btc-signup"
          >
            One Btc Club
          </NavLink>
          <NavLink 
            className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
            to="/add-btc-profile"
          >
            Add Btc Profile
          </NavLink>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/one-btc-signup" element={<SignUpOneBtcClub />} />
        <Route path="/login" element={<Login />} />
        <Route path="/add-btc-profile" element={<AddBtcProfile />} />
      </Routes>
    </div>
  );
}

export default App;

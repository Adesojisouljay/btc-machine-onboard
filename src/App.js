import React, { useState } from 'react';
import { Routes, Route } from "react-router-dom";
import { SignUp } from './pages/SignUp';
import { SignUpOneBtcClub } from './pages/SignUpOneBtcClub';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import './App.css';

function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/one-btc-signup" element={<SignUpOneBtcClub />} />
      <Route path="/login" element={<Login />} />
    </Routes>
    </>
  );
}

export default App;

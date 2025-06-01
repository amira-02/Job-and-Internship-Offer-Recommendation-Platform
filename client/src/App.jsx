import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Employer from './pages/Employer';
import EmployerDashboard from './pages/EmployerDashboard';
import Admin from './pages/Admin';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
<Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/employer" element={<Employer />} />
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/admin" element={<Admin />} />
</Routes> 
      </div>
    </Router>
  );
}

export default App; 
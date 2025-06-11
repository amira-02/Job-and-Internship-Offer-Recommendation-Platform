import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Employer from './pages/Employer';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VerifyEmail from './pages/VerifyEmail';
import Header from './components/Header';
import Profile from './pages/Profile';
import JobOffers from './pages/JobOffers';
import JobOfferDetails from './pages/JobOfferDetails';
import CreateJobOffer from './pages/CreateJobOffer';
import EditJobOffer from './pages/EditJobOffer';
import Applications from './pages/Applications';
import ApplicationDetails from './pages/ApplicationDetails';
import OfferCandidates from './pages/OfferCandidates'; // <-- Ajoute cette ligne
import NotFound from './pages/NotFound';
import './styles/App.css';

function AppContent() {
  const location = useLocation();

  // Cacher le header uniquement sur cette page
  const hideHeader = /^\/admin\/offers\/[^/]+\/candidates$/.test(location.pathname);

  return (
    <div className="app">
      {!hideHeader && <Header />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/employer" element={<Employer />} />
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/job-offers" element={<JobOffers />} />
          <Route path="/job-offers/:id" element={<JobOfferDetails />} />
          <Route path="/create-job-offer" element={<CreateJobOffer />} />
          <Route path="/edit-job-offer/:id" element={<EditJobOffer />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:id" element={<ApplicationDetails />} />
          <Route path="/admin/offers/:id/candidates" element={<OfferCandidates />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

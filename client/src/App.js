import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/login";
import RegistrationWorkflow from "./pages/register";
import AdminPage from "./pages/AdminPage";
import Cards from "./pages/cards";
import Offers from "./pages/Offers";
import ProfilePage from "./pages/ProfilePage";
import Employer from "./pages/Employer";
import EmployerDashboard from "./pages/EmployerDashboard";
import "./App.css";
import ApplyForm from './pages/ApplyForm';
 import OfferCandidates from './pages/OfferCandidates';
import OfferDetail from './pages/OfferDetail';
import CvAnalysisPage from './pages/CvAnalysisPage';
import EditJobOffer from './pages/EditJobOffer';
function AppContent() {
  const location = useLocation();

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegistrationWorkflow />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/employer" element={<Employer />} />
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/offers/:id/apply" element={<ApplyForm />} />   
        <Route path="/employer/offers/:id/candidates" element={<OfferCandidates />} />
         <Route path="/offers/:id" element={<OfferDetail />} />
         <Route path="/cv-analysis" element={<CvAnalysisPage />} />
         <Route path="/edit-job-offer/:id" element={<EditJobOffer />} />


      </Routes>
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


// export default function App(){
// return <div>aslema</div>;
// }

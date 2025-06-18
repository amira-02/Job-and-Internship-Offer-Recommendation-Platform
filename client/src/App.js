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

// Composant pour gérer l'affichage conditionnel du header
function AppContent() {
  const location = useLocation();
  // const isEmployerDashboard = location.pathname === '/employer/dashboard';

  return (
    <div className="app">
      {/* {!isEmployerDashboard && <Header />} */}
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
         {/* <Route path="/cv-analysis/:userId/:cvIndex" element={<CvAnalysisPage />} /> */}
         <Route path="/cv-analysis" element={<CvAnalysisPage />} />
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

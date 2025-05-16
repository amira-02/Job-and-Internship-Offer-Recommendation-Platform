import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/register";
import AdminPage from "./pages/AdminPage";
import Cards from "./pages/cards";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/cards" element={<Cards />} />
      </Routes>
    </Router>
  );
}

export default App;


// export default function App(){
// return <div>aslema</div>;
// }

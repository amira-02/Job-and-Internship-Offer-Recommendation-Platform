import React from "react";
import Register from "./pages/register";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from "./pages/login";
import Cards from "./pages/cards";
import "react-toastify/dist/ReactToastify.css";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Cards />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/register" element={<Register />} />
        <Route exact path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}


// export default function App(){
// return <div>aslema</div>;
// }

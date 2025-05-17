import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Header from "../components/Header";

export default function Cards() {
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(['jwt']);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      if (!cookies.jwt) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:3000",
          {},
          {
            withCredentials: true,
          }
        );

        if (!response.data.status) {
          removeCookie("jwt");
          navigate("/login");
          return;
        }

        setIsAdmin(response.data.isAdmin);
        
        // Si c'est un admin, rediriger vers la page admin
        if (response.data.isAdmin) {
          navigate("/admin");
          return;
        }

        // Si c'est un utilisateur normal, afficher le message de bienvenue
        toast(`Bienvenue ${response.data.user} ! 🎉`, {
          theme: "dark",
        });
      } catch (err) {
        console.error("Erreur de vérification:", err);
        removeCookie("jwt");
        navigate("/login");
      }
    };

    verifyUser();
  }, [cookies.jwt, navigate, removeCookie]);

  const handleLogout = () => {
    removeCookie("jwt");
    navigate("/login");
  };

  return (
    <>
      <Header />
      <div className="cards-container" style={{ 
        padding: '20px', 
        marginTop: '80px',
        textAlign: 'center' 
      }}>
        <h1>Mes Recommandations</h1>
        <p>Bienvenue dans votre espace personnel</p>
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Se déconnecter
        </button>
      </div>
      <ToastContainer />
    </>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();
  const [cookies] = useCookies([]);
  const [values, setValues] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (cookies.jwt) {
      // Vérifier si l'utilisateur est admin
      const verifyUser = async () => {
        try {
          const { data } = await axios.post(
            "http://localhost:4000/api/auth/checkUser",
            {},
            { withCredentials: true }
          );
          if (data.status) {
            if (data.isAdmin) {
              navigate("/admin");
            } else {
              navigate("/");
            }
          }
        } catch (err) {
          console.log(err);
        }
      };
      verifyUser();
    }
  }, [cookies, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    console.log("Attempting login with:", values); // Log des valeurs

    try {
      // Changement de l'URL pour correspondre à celle du backend
      const { data } = await axios.post(
        "http://localhost:4000/login", // Retour à l'URL originale
        values,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Login response:", data); // Log de la réponse

      if (data) {
        if (data.errors) {
          const { email, password } = data.errors;
          if (email) {
            console.log("Email error:", email);
            toast.error(email);
          }
          if (password) {
            console.log("Password error:", password);
            toast.error(password);
          }
        } else if (data.status) {
          console.log("Login successful, redirecting...");
          toast.success("Login successful!");
          
          // Vérification des identifiants admin directement ici
          if (values.email === "admin@gmail.com" && values.password === "admin") {
            console.log("Admin login detected, redirecting to admin page");
            navigate("/admin");
          } else {
            console.log("Regular user login, redirecting to home");
            navigate("/");
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        console.error("Server response:", error.response.data);
        toast.error(error.response.data.message || "Login failed");
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        console.error("No response received");
        toast.error("Cannot connect to server. Please check if the server is running.");
      } else {
        // Erreur lors de la configuration de la requête
        console.error("Request error:", error.message);
        toast.error("An error occurred during login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Login to your Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={values.email}
            onChange={(e) =>
              setValues({ ...values, [e.target.name]: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={values.password}
            onChange={(e) =>
              setValues({ ...values, [e.target.name]: e.target.value })
            }
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <span>
          Don't have an account? <Link to="/register">Register</Link>
        </span>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Login;

import React from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

function AdminPage() {
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies([]);

  const logOut = () => {
    removeCookie("jwt");
    navigate("/login");
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Welcome Admin!</h1>
      <p>This is the admin dashboard</p>
      <button 
        onClick={logOut}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Log out
      </button>
    </div>
  );
}

export default AdminPage; 
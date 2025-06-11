import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ApplyForm = () => {
  const { id } = useParams(); // récupère l'id de l'offre depuis l'URL
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:3000/api/joboffers/${id}/apply`, { email });
      alert('Candidature envoyée !');
      navigate('/offers'); // retourne à la liste des offres
    } catch (err) {
      alert('Erreur lors de la candidature');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 8px 32px rgba(26,127,100,0.18)', minWidth: 320 }}>
        <h2>Postuler à l'offre</h2>
        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ margin: '16px 0', padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%' }}
        />
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>
            Envoyer
          </button>
          <button type="button" onClick={() => navigate('/offers')} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplyForm;
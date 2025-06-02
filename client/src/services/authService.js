import { toast } from 'react-toastify';

export const logout = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la déconnexion');
    }

    // Supprimer les données du localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Supprimer tous les cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Supprimer spécifiquement le cookie JWT
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    toast.success('Déconnexion réussie');
    return true;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    toast.error('Erreur lors de la déconnexion');
    return false;
  }
}; 
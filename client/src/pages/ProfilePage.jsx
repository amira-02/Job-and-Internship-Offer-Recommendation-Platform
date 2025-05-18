import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Box, Container, Typography, CircularProgress, Alert, Paper, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cookies] = useCookies(['jwt']);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      // Vérifier si l'utilisateur est connecté (présence du JWT)
      if (!cookies.jwt) {
        // Si pas connecté, rediriger vers la page de connexion
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Envoyer la requête au backend pour obtenir les données de l'utilisateur
        const response = await axios.get('http://localhost:3000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${cookies.jwt}`
          },
          withCredentials: true
        });

        // La réponse contient directement les données utilisateur
        setUserData(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
        // Gérer les erreurs de requête
        if (err.response) {
           // Erreur de réponse du serveur (ex: 401 Unauthorized si JWT invalide/expiré)
           setError(err.response.data.message || `Erreur serveur (${err.response.status}).`);
           if (err.response.status === 401) {
              navigate('/login'); // Rediriger si non autorisé
           }
        } else if (err.request) {
           setError('Impossible de se connecter au serveur pour charger les données utilisateur.');
        } else {
           setError('Erreur lors de la configuration de la requête pour les données utilisateur.');
        }
        // Rediriger vers la connexion en cas d'erreur grave
        // navigate('/login'); // Décommenter si vous voulez toujours rediriger en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [cookies.jwt, navigate]); // Re-exécuter si le JWT change ou si navigate change (bien que navigate soit stable)

  if (loading) {
    return (
      <>
        <Header />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
          gap={2}
          sx={{ backgroundColor: '#f5f5f5', pt: '80px' }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: 'black' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Chargement du profil...
          </Typography>
        </Box>
      </>
    );
  }

  if (error) {
     return (
      <>
        <Header />
        <Container maxWidth="md" sx={{ py: 4, pt: '100px' }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
           <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Veuillez réessayer plus tard ou vérifier votre connexion.
          </Typography>
        </Container>
      </>
    );
  }

  // Afficher les données utilisateur si elles sont chargées et qu'il n'y a pas d'erreur
  return (
    <>
      <Header />
      <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4, pt: '80px' }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Profil Utilisateur
            </Typography>
            {userData ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {userData.email}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Nom:</strong> {userData.lastName}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Prénom:</strong> {userData.firstName}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Gouvernorat:</strong> {userData.governorate}
                </Typography>
                {/* Ajouter d'autres champs ici si userData contient plus d'informations */}
                {userData.experienceLevel && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Niveau d'expérience:</strong> {userData.experienceLevel}
                  </Typography>
                )}
                 {userData.employmentTypes && userData.employmentTypes.length > 0 && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Types d'emploi ouverts:</strong> {userData.employmentTypes.join(', ')}
                  </Typography>
                )}
                 {userData.desiredJobTitle && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Poste recherché:</strong> {userData.desiredJobTitle}
                  </Typography>
                )}
                 {userData.selectedDomains && userData.selectedDomains.length > 0 && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Domaines intéressés:</strong> {userData.selectedDomains.join(', ')}
                  </Typography>
                )}
                 {userData.city && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Ville:</strong> {userData.city}
                  </Typography>
                )}
                 {userData.mobileNumber && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Portable:</strong> {userData.mobileNumber}
                  </Typography>
                )}
                {/* Continuer avec les autres champs comme country, zipCode, address, otherPhone si vous voulez les afficher */}

                {/* Section CV */}
                <Box sx={{ mt: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fafafa' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    CV
                  </Typography>
                  {userData.cv ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" sx={{ flex: 1 }}>
                        <strong>Fichier:</strong> {userData.cv.fileName}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={async () => {
                          try {
                            const response = await axios.get(`http://localhost:3000/api/auth/cv/${userData._id}`, {
                              responseType: 'blob',
                              headers: {
                                Authorization: `Bearer ${cookies.jwt}`
                              },
                              withCredentials: true
                            });
                            
                            // Créer un lien temporaire pour le téléchargement
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', userData.cv.fileName);
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            window.URL.revokeObjectURL(url);
                          } catch (err) {
                            console.error('Erreur lors du téléchargement du CV:', err);
                            setError('Erreur lors du téléchargement du CV. Veuillez réessayer.');
                          }
                        }}
                        sx={{
                          backgroundColor: 'black',
                          '&:hover': {
                            backgroundColor: '#333',
                          },
                        }}
                      >
                        Télécharger CV
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      Aucun CV téléchargé.
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Aucune donnée utilisateur disponible.
              </Typography>
            )}
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default ProfilePage; 
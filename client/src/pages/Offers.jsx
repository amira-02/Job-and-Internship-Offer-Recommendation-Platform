import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Header from '../components/Header';
import {
  Box,
  Container,
  Typography,
  Grid,
  Pagination,
  CircularProgress,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const API_URL = 'http://localhost:3000/api/joboffers';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const offersPerPage = 10;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        console.log('Tentative de connexion à l\'API:', API_URL);
        const response = await axios.get(API_URL);
        console.log('Réponse de l\'API reçue:', response.data);
        
        if (Array.isArray(response.data)) {
          setOffers(response.data);
          setError(null);
        } else {
          console.error('Format de données invalide:', response.data);
          setError('Format de données invalide reçu du serveur');
        }
      } catch (err) {
        console.error('Erreur détaillée:', err);
        if (err.response) {
          // Le serveur a répondu avec un code d'erreur
          console.error('Réponse du serveur:', err.response.data);
          console.error('Status:', err.response.status);
          setError(`Erreur serveur (${err.response.status}): ${err.response.data.message || 'Erreur inconnue'}`);
        } else if (err.request) {
          // La requête a été faite mais aucune réponse n'a été reçue
          console.error('Pas de réponse du serveur');
          setError('Impossible de se connecter au serveur. Veuillez vérifier que le serveur est en cours d\'exécution sur le port 3000.');
        } else {
          // Une erreur s'est produite lors de la configuration de la requête
          console.error('Erreur de configuration:', err.message);
          setError(`Erreur de configuration: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(offers.length / offersPerPage);

  // Obtenir les offres pour la page courante
  const currentOffers = offers.slice(
    (page - 1) * offersPerPage,
    page * offersPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          sx={{ 
            backgroundColor: '#f5f5f5',
            pt: '80px' // Add padding top to account for fixed header
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: 'black' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Chargement des offres...
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
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontSize: '1.1rem'
              }
            }}
          >
            {error}
          </Alert>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Suggestions pour résoudre le problème :
          </Typography>
          <ul style={{ marginTop: '1rem', color: 'text.secondary' }}>
            <li>Vérifiez que le serveur backend est en cours d'exécution sur le port 3000</li>
            <li>Assurez-vous que MongoDB est en cours d'exécution</li>
            <li>Vérifiez la console du navigateur pour plus de détails sur l'erreur</li>
          </ul>
        </Container>
      </>
    );
  }

  if (offers.length === 0) {
    return (
      <>
        <Header />
        <Container maxWidth="md" sx={{ py: 4, pt: '100px' }}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Aucune offre d'emploi n'est disponible pour le moment.
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Box sx={{ 
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        pt: '80px' // Add padding top to account for fixed header
      }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              color: 'black',
              mb: 6,
              fontSize: { xs: '2rem', md: '2.5rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Offres d'emploi disponibles
            <Typography
              component="span"
              sx={{
                display: 'block',
                fontSize: '1.2rem',
                color: 'text.secondary',
                mt: 1,
                fontWeight: 400,
              }}
            >
              {offers.length} opportunités trouvées
            </Typography>
          </Typography>

          <Grid container spacing={3}>
            {currentOffers.map((offer) => (
              <Grid item xs={12} key={offer._id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    border: '1px solid #e0e0e0',
                    backgroundColor: 'white',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                      borderColor: 'black',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h5"
                        component="h2"
                        sx={{
                          fontWeight: 700,
                          color: 'black',
                          mb: 1,
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                          lineHeight: 1.3,
                        }}
                      >
                        {offer.title}
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {offer.company && (
                          <Chip
                            icon={<BusinessIcon />}
                            label={offer.company}
                            sx={{
                              backgroundColor: 'black',
                              color: 'white',
                              fontWeight: 500,
                              '& .MuiChip-icon': {
                                color: 'white',
                              },
                            }}
                          />
                        )}
                        {offer.location && (
                          <Chip
                            icon={<LocationOnIcon />}
                            label={offer.location}
                            sx={{
                              backgroundColor: 'white',
                              color: 'black',
                              border: '1px solid black',
                              fontWeight: 500,
                              '& .MuiChip-icon': {
                                color: 'black',
                              },
                            }}
                          />
                        )}
                        {offer.contractType && (
                          <Chip
                            label={offer.contractType}
                            sx={{
                              backgroundColor: 'white',
                              color: 'black',
                              border: '1px solid black',
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </Box>

                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.6,
                        }}
                      >
                        {offer.description}
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: 'text.secondary',
                          mb: 2,
                        }}
                      >
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="body2">
                          Publiée le{' '}
                          {format(new Date(offer.postedDate), 'dd MMMM yyyy', {
                            locale: fr,
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <Divider />

                  <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                    <Tooltip title="Voir l'offre complète">
                      <Button
                        variant="contained"
                        endIcon={<OpenInNewIcon />}
                        onClick={() => window.open(offer.sourceUrl, '_blank')}
                        sx={{
                          backgroundColor: 'black',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'grey.800',
                          },
                          px: 3,
                          py: 1,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Voir l'offre
                      </Button>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 6,
                mb: 2,
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? 'small' : 'large'}
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: 'black',
                    fontSize: '1rem',
                    '&.Mui-selected': {
                      backgroundColor: 'black',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'grey.800',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  },
                }}
              />
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default Offers; 
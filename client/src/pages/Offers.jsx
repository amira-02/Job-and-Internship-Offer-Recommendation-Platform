import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Header from '../components/Header';
import FilterSidebar from '../components/FilterSidebar';
import {
  Box,
  Container,
  Typography,
  Grid,
  Pagination,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  Alert,
  Tooltip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MenuIcon from '@mui/icons-material/Menu';

const API_URL = 'http://localhost:3000/api/joboffers';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const offersPerPage = 10;

  const [filterCriteria, setFilterCriteria] = useState({
    city: '',
    domain: '',
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get(API_URL);

        if (Array.isArray(response.data)) {
          setOffers(response.data);
          setFilteredOffers(response.data);
          setError(null);
        } else {
          setError('Format de données invalide reçu du serveur');
        }
      } catch (err) {
        if (err.response) {
          setError(`Erreur serveur (${err.response.status}): ${err.response.data.message || 'Erreur inconnue'}`);
        } else if (err.request) {
          setError('Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d\'exécution sur le port 3000.');
        } else {
          setError(`Erreur de configuration: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  useEffect(() => {
    const { city, domain } = filterCriteria;
    const filtered = offers.filter((offer) => {
      const offerLocation = offer.location?.toLowerCase() || '';
      const offerDomain = offer.domain?.toLowerCase() || '';
      const filterCity = city?.toLowerCase() || '';
      const filterDomain = domain?.toLowerCase() || '';
      const cityMatch = offerLocation.includes(filterCity) || filterCity === '';
      const domainMatch = offerDomain.includes(filterDomain) || filterDomain === '';
      return cityMatch && domainMatch;
    });
    setFilteredOffers(filtered);
    setPage(1);
  }, [filterCriteria, offers]);

  const totalPages = Math.ceil(filteredOffers.length / offersPerPage);
  const currentOffers = filteredOffers.slice(
    (page - 1) * offersPerPage,
    page * offersPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
          sx={{ backgroundColor: '#f5f5f5', pt: '80px' }}
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
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
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

  return (
    <>
      <Header />
      <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4, pt: '80px' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
            {!isMobile && (
              // <Grid item md={3} sx={{ 
              //   position: 'sticky',
              //   top: 100,
              //   height: 'calc(100vh - 120px)',
              //   overflowY: 'auto'
              // }}>
                <FilterSidebar offers={offers} onFilterChange={setFilterCriteria} />
              // </Grid>
            )}

            <Grid item xs={12} md={isMobile ? 12 : 9}>
              {isMobile && (
                <IconButton
                  onClick={toggleSidebar}
                  sx={{ mb: 2, bgcolor: 'black', color: 'white', '&:hover': { bgcolor: 'grey.800' } }}
                >
                  <MenuIcon />
                </IconButton>
              )}

              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  color: 'black',
                  mb: 3,
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
                  {filteredOffers.length} opportunités trouvées
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
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="h5"
                            component="h2"
                            sx={{
                              fontWeight: 700,
                              color: 'black',
                              mb: 1,
                              fontSize: { xs: '1.1rem', md: '1.35rem' },
                            }}
                          >
                            {offer.title}
                          </Typography>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {offer.company && (
                              <Chip
                                icon={<BusinessIcon fontSize="small" />}
                                label={offer.company}
                                sx={{
                                  backgroundColor: 'black',
                                  color: 'white',
                                  fontWeight: 500,
                                  '& .MuiChip-icon': { color: 'white' },
                                }}
                              />
                            )}
                            {offer.location && (
                              <Chip
                                icon={<LocationOnIcon fontSize="small" />}
                                label={offer.location}
                                sx={{
                                  backgroundColor: '#e0e0e0',
                                  color: 'black',
                                  fontWeight: 500,
                                }}
                              />
                            )}
                            {offer.contractType && (
                              <Chip
                                label={offer.contractType}
                                sx={{ backgroundColor: '#e0e0e0', color: 'black' }}
                              />
                            )}
                            {offer.domain && (
                              <Chip
                                label={offer.domain}
                                sx={{ backgroundColor: '#e0e0e0', color: 'black' }}
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

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="body2">
                              Publiée le {format(new Date(offer.postedDate), 'dd MMMM yyyy', { locale: fr })}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>

                      <Divider />

                      <CardActions sx={{ p: { xs: 2, md: 3 }, justifyContent: 'flex-end' }}>
                        <Tooltip title="Voir l'offre complète">
                          <Button
                            variant="contained"
                            endIcon={<OpenInNewIcon />}
                            onClick={() => window.open(offer.sourceUrl, '_blank')}
                            sx={{
                              backgroundColor: 'black',
                              color: 'white',
                              '&:hover': { backgroundColor: '#333' },
                              px: 3,
                              borderRadius: 2,
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
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? 'small' : 'large'}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: 'black',
                        '&.Mui-selected': {
                          backgroundColor: 'black',
                          color: 'white',
                          '&:hover': { backgroundColor: 'grey.800' },
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {isMobile && (
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={toggleSidebar}
          sx={{ 
            '& .MuiDrawer-paper': { 
              width: 280,
              top: '80px',
              height: 'calc(100% - 80px)'
            } 
          }}
        >
          <FilterSidebar offers={offers} onFilterChange={setFilterCriteria} />
        </Drawer>
      )}
    </>
  );
};

export default Offers;
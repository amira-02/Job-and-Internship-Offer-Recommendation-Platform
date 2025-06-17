// src/pages/OfferDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Button, 
  Divider,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
  Paper
} from '@mui/material';
import { 
  ArrowBack, 
  Send, 
  LocationOn, 
  Work, 
  AttachMoney, 
  Schedule,
  Description,
  Business,
  People,
  Event
} from '@mui/icons-material';

const OfferDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:3000/api/joboffers/${id}`)
      .then((res) => {
        setOffer(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Erreur lors du chargement de l\'offre');
        setLoading(false);
      });
  }, [id]);

  const handleApply = () => {
    if (offer?.applicationUrl) {
      window.open(offer.applicationUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={4}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Retour
        </Button>
      </Box>
    );
  }

  if (!offer) return null;

  return (
    <Box sx={{ 
      background: '#f9fafb',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header with back button */}
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="text" 
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 600,
              '&:hover': {
                background: 'transparent'
              }
            }}
          >
            Retour aux offres
          </Button>
        </Box>
        
        {/* Job Header */}
        <Paper elevation={0} sx={{
          background: 'white',
          borderRadius: 3,
          p: 4,
          mb: 4,
          boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Box>
            <Typography 
              variant="h3" 
              fontWeight={800}
              gutterBottom
              sx={{ 
                color: theme.palette.text.primary,
                fontSize: isMobile ? '1.8rem' : '2.4rem',
                lineHeight: 1.2
              }}
            >
              {offer.jobTitle || offer.title}
            </Typography>
            
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <Business sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {offer.employer || offer.company}
              </Typography>
            </Stack>
            
            <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 2 }}>
              <Chip 
                label={offer.jobType || offer.contractType || 'N/A'} 
                color="primary"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 500 }}
              />
              <Chip 
                label={offer.address || offer.country || 'Non précisé'} 
                color="secondary"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Stack>
          </Box>
          
          {/* <Box sx={{
            background: 'linear-gradient(135deg, #f0f7ff, #e6f7ff)',
            borderRadius: 2,
            p: 3,
            mt: 3,
            textAlign: 'center'
          }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Salaire
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ color: theme.palette.primary.dark }}>
              {offer.minSalary && offer.maxSalary
                ? `${offer.minSalary} - ${offer.maxSalary} ${offer.salaryPeriod || ''}`
                : offer.salary || 'Non précisé'}
            </Typography>
          </Box>
           */}
          
        </Paper>

        {/* Job Details Card */}
        <Paper elevation={0} sx={{
          background: 'white',
          borderRadius: 3,
          p: 4,
          mb: 4,
          boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: `2px solid ${theme.palette.primary.light}`
          }}>
            <Work sx={{ 
              color: 'white', 
              background: theme.palette.primary.main,
              borderRadius: '50%',
              p: 1,
              fontSize: 32 
            }} />
            <Typography variant="h5" fontWeight={700}>
              Détails de l'offre
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 3
          }}>
            <DetailItem 
              icon={<Work sx={{ color: theme.palette.primary.main }} />}
              label="Type de contrat"
              value={offer.jobType || offer.contractType || 'N/A'} 
            />
            
            <DetailItem 
              icon={<AttachMoney sx={{ color: theme.palette.primary.main }} />}
              label="Salaire"
              value={
                (offer.minSalary && offer.maxSalary)
                  ? `${offer.minSalary} - ${offer.maxSalary} ${offer.salaryPeriod || ''}`
                  : offer.salary || 'Non précisé'
              } 
            />
            
            <DetailItem 
              icon={<Schedule sx={{ color: theme.palette.primary.main }} />}
              label="Expérience"
              value={offer.experience || 'N/A'} 
            />
            
            <DetailItem 
              icon={<LocationOn sx={{ color: theme.palette.primary.main }} />}
              label="Localisation"
              value={
                offer.address && offer.country 
                  ? `${offer.address}, ${offer.country}`
                  : offer.address || offer.country || 'Non précisée'
              } 
            />
          </Box>
        </Paper>

        {/* Description Section */}
        <Paper elevation={0} sx={{
          background: 'white',
          borderRadius: 3,
          p: 4,
          mb: 4,
          boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: `2px solid ${theme.palette.primary.light}`
          }}>
            <Description sx={{ 
              color: 'white', 
              background: theme.palette.primary.main,
              borderRadius: '50%',
              p: 1,
              fontSize: 32 
            }} />
            <Typography variant="h5" fontWeight={700}>
              Description du poste
            </Typography>
          </Box>
          
          <Box sx={{ 
            lineHeight: 1.7,
            '& p': { mb: 2 },
            '& ul': { pl: 3, mb: 2 },
            '& li': { mb: 1 }
          }}>
            {parseDescription(offer.jobDescription || offer.description)}
          </Box>
        </Paper>
        
        {/* Skills Section */}
        {offer.skills && offer.skills.length > 0 && (
          <Paper elevation={0} sx={{
            background: 'white',
            borderRadius: 3,
            p: 4,
            mb: 4,
            boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 3,
              pb: 2,
              borderBottom: `2px solid ${theme.palette.primary.light}`
            }}>
              <People sx={{ 
                color: 'white', 
                background: theme.palette.primary.main,
                borderRadius: '50%',
                p: 1,
                fontSize: 32 
              }} />
              <Typography variant="h5" fontWeight={700}>
                Compétences requises
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {offer.skills.map((skill, index) => (
                <Chip 
                  key={index} 
                  label={skill} 
                  sx={{ 
                    background: 'rgba(25, 118, 210, 0.08)',
                    color: theme.palette.primary.dark,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    py: 1.2,
                    px: 2,
                    borderRadius: 1
                  }}
                />
              ))}
            </Box>
          </Paper>
        )}
        
        {/* Company Card */}
        <Paper elevation={0} sx={{
          background: 'white',
          borderRadius: 3,
          p: 4,
          mb: 4,
          boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: `2px solid ${theme.palette.primary.light}`
          }}>
            <Business sx={{ 
              color: 'white', 
              background: theme.palette.primary.main,
              borderRadius: '50%',
              p: 1,
              fontSize: 32 
            }} />
            <Typography variant="h5" fontWeight={700}>
              À propos de l'entreprise
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{
              width: 50,
              height: 50,
              borderRadius: 1,
              background: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}>
              <Business sx={{ color: theme.palette.primary.main, fontSize: 26 }} />
            </Box>
            <Typography variant="body1" fontWeight={600}>{offer.employer || offer.company}</Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {offer.companyDescription || "Cette entreprise n'a pas encore fourni de description. Vous pouvez en savoir plus en visitant leur site web."}
          </Typography>
        </Paper>
        
        {/* Mobile Apply Button */}
        {isMobile && (
          <Box sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'white',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            p: 2,
            zIndex: 1000
          }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Send />}
              onClick={handleApply}
              disabled={!offer.applicationUrl}
              sx={{ 
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #1976d2, #115293)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0, #0d47a1)'
                }
              }}
            >
              Postuler maintenant
            </Button>
          </Box>
        )}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
             <button
    style={{ 
      background: '#e8f1fa', 
      color: '#1976d2', 
      border: 'none', 
      borderRadius: 10, 
      padding: '8px 24px', 
      fontWeight: 600, 
      cursor: 'pointer' 
    }}
    onClick={() => {
      if (offer.scraped && offer.link) {
        window.open(offer.link, '_blank');
      } else {
        navigate(`/offers/${offer._id}/apply`);
      }
    }}
  >
    APPLY
  </button>
            
            {offer.deadline && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mt: 2
              }}>
                <Event sx={{ color: theme.palette.warning.main }} />
                <Typography variant="body2" color="text.secondary">
                  Date limite: {new Date(offer.deadline).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Box>
      </Container>
    </Box>
  );
};

// Helper components
const DetailItem = ({ icon, label, value }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'flex-start',
    gap: 2,
    mb: 3
  }}>
    <Box sx={{ 
      width: 36, 
      height: 36, 
      borderRadius: '50%', 
      background: 'rgba(25, 118, 210, 0.08)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexShrink: 0,
      mt: 0.5
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={500}>{value}</Typography>
    </Box>
  </Box>
);

// Helper function to parse description
const parseDescription = (text) => {
  if (!text) return null;
  
  return text.split('\n\n').map((paragraph, index) => {
    if (paragraph.startsWith('- ')) {
      const items = paragraph.split('\n').filter(item => item.startsWith('- '));
      return (
        <ul key={index} style={{ 
          marginTop: 0, 
          marginBottom: '1.5rem',
          paddingLeft: '1.5rem',
          listStyleType: 'disc'
        }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ 
              marginBottom: '0.75rem',
              lineHeight: 1.7
            }}>
              {item.replace('- ', '')}
            </li>
          ))}
        </ul>
      );
    }
    return <p key={index} style={{ marginBottom: '1.5rem' }}>{paragraph}</p>;
  });
};

export default OfferDetail;
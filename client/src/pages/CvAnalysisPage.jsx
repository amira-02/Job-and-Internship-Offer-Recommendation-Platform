import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
} from '@mui/material';

export default function CvAnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysis, topOffers, cvBufferBase64 } = location.state || {};

  // Vérification des données nécessaires
  if (!analysis || !cvBufferBase64) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography color="error">CV ou analyse manquants</Typography>
        <Button onClick={() => navigate(-1)}>Retour</Button>
      </Paper>
    );
  }

  // Rendu ligne par ligne de l'analyse IA
  const renderAnalysis = (text) => {
    return text.split('\n').map((line, idx) => (
      <Typography key={idx} paragraph sx={{ whiteSpace: 'pre-wrap' }}>
        {line}
      </Typography>
    ));
  };

  return (
    <Box display="flex" height="100vh">
      {/* Partie gauche : aperçu PDF du CV */}
      <Box flex={1} borderRight="1px solid #ccc">
        <iframe
          title="CV PDF"
          src={`data:application/pdf;base64,${cvBufferBase64}`}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </Box>

      {/* Partie droite : analyse IA + offres compatibles */}
      <Box flex={1} p={4} overflow="auto">
        <Typography variant="h5" gutterBottom>
          🧠 Résultat de l’analyse du CV
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {renderAnalysis(analysis)}

        <Typography variant="h6" sx={{ mt: 4 }}>
          🎯 Offres compatibles
        </Typography>

        {topOffers && topOffers.length > 0 ? (
          topOffers.map((offer) => (
            <Box
              key={offer._id}
              onClick={() => navigate(`/offers/${offer._id}`)}
              sx={{
                border: '1px solid #ddd',
                borderRadius: 1,
                padding: 2,
                marginY: 1,
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {offer.jobTitle}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {offer.jobDescription?.slice(0, 120)}...
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Score IA : {offer.compatibilityScore}/10
              </Typography>
            </Box>
          ))
        ) : (
          <Typography sx={{ mt: 1 }}>Aucune offre compatible trouvée.</Typography>
        )}

        <Button variant="contained" sx={{ mt: 4 }} onClick={() => navigate(-1)}>
          Retour
        </Button>
      </Box>
    </Box>
  );
}

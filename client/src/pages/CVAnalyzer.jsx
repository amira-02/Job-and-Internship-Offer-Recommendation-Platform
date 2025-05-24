import React, { useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Chip, Divider, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const CVAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('cv', uploadedFile);

        const response = await fetch('http://localhost:3000/api/analyze-cv', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Erreur lors de l\'analyse du CV');
        }

        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1a1a1a' }}>
        Analyse de CV avec IA
      </Typography>

      {/* Upload Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3,
          bgcolor: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}
      >
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{
            bgcolor: '#1976d2',
            '&:hover': { bgcolor: '#1565c0' },
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontSize: 16
          }}
        >
          Télécharger votre CV
          <VisuallyHiddenInput type="file" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
        </Button>
        {file && (
          <Typography sx={{ mt: 2, color: '#666' }}>
            Fichier sélectionné: {file.name}
          </Typography>
        )}
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            bgcolor: '#ffebee',
            color: '#c62828'
          }}
        >
          {error}
        </Paper>
      )}

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Score Global */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
              Score Global
            </Typography>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={analysis.scoreGlobal * 10}
                size={120}
                thickness={4}
                sx={{
                  color: analysis.scoreGlobal >= 7 ? '#4caf50' : 
                         analysis.scoreGlobal >= 5 ? '#1976d2' : '#f44336'
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h4" component="div">
                  {analysis.scoreGlobal}/10
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Points Forts */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#2e7d32', fontWeight: 'bold' }}>
              Points Forts
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {analysis.pointsForts.map((point, index) => (
                <Chip
                  key={index}
                  label={point}
                  sx={{
                    bgcolor: '#e8f5e9',
                    color: '#2e7d32',
                    fontWeight: 500
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Points à Améliorer */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#c62828', fontWeight: 'bold' }}>
              Points à Améliorer
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {analysis.pointsFaibles.map((point, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Typography sx={{ color: '#c62828' }}>•</Typography>
                  <Typography>{point}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Compétences */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
              Compétences
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: '#1976d2' }}>
                  Compétences Techniques
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {analysis.competencesTechniques.map((competence, index) => (
                    <Chip
                      key={index}
                      label={competence}
                      sx={{
                        bgcolor: '#e3f2fd',
                        color: '#1976d2',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: '#1976d2' }}>
                  Compétences Non-Techniques
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {analysis.competencesNonTechniques.map((competence, index) => (
                    <Chip
                      key={index}
                      label={competence}
                      sx={{
                        bgcolor: '#e3f2fd',
                        color: '#1976d2',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Niveau d'Expérience et Domaines */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: '#1976d2' }}>
                  Niveau d'Expérience
                </Typography>
                <Chip
                  label={analysis.niveauExperience}
                  sx={{
                    bgcolor: '#e3f2fd',
                    color: '#1976d2',
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 2
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: '#1976d2' }}>
                  Domaines d'Expertise
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {analysis.domainesExpertise.map((domaine, index) => (
                    <Chip
                      key={index}
                      label={domaine}
                      sx={{
                        bgcolor: '#e3f2fd',
                        color: '#1976d2',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Recommandations */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
              Recommandations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {analysis.recommandations.map((recommandation, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Typography sx={{ color: '#1976d2' }}>•</Typography>
                  <Typography>{recommandation}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Mots-clés */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
              Mots-clés Suggérés
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {analysis.motsClesSuggérés.map((motCle, index) => (
                <Chip
                  key={index}
                  label={motCle}
                  sx={{
                    bgcolor: '#e3f2fd',
                    color: '#1976d2',
                    fontWeight: 500
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Offres Recommandées */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
              Offres Recommandées
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
              {analysis.recommendedJobs.map((job, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {job.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BusinessIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                    <Typography>{job.company}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOnIcon sx={{ color: '#ff7043', fontSize: 20 }} />
                    <Typography>{job.location}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AttachMoneyIcon sx={{ color: '#43a047', fontSize: 20 }} />
                    <Typography>{job.salary}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                    {job.description}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: '#1976d2',
                      '&:hover': { bgcolor: '#1565c0' },
                      borderRadius: 2
                    }}
                  >
                    Postuler
                  </Button>
                </Paper>
              ))}
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default CVAnalyzer; 
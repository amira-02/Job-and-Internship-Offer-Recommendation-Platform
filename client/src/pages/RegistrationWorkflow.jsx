import React, { useState } from 'react';
import { Box, Container, Stepper, Step, StepLabel, Typography, Button, CircularProgress } from '@mui/material';
import Step1Form from '../components/Step1Form';
import Step2Form from '../components/Step2Form';
import Step3Form from '../components/Step3Form';
import Step4Form from '../components/Step4Form';
import axios from 'axios'; // Importer axios pour les appels API
import { useCookies } from 'react-cookie'; // Importer useCookies
import { useNavigate } from 'react-router-dom'; // Importer useNavigate
import '../styles/Auth.css'; // Importer les styles d'authentification
import Header from '../components/Header'; // Importer le composant Header
// Importer les autres étapes plus tard
// import Step2Form from '../components/Step2Form';
// import Step3Form from '../components/Step3Form';

const steps = ['Personal Information', 'Experience and Preferences', 'Location and Contact', 'Education'];

const RegistrationWorkflow = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1
    name: '',
    email: '',
    password: '',
    governorate: '',
    // Step 2
    yearsOfExperience: '', // Initialize Step 2 fields
    employmentTypes: [],
    jobTitle: '',
    domains: [],
    // Step 3
    location: '', // Initialize Step 3 fields
    phoneNumber: '',
    linkedin: '',
    github: '',
    portfolio: '',
    // Step 4
    diplomaSpecialty: '', // Initialize Step 4 fields
    university: '',
    studyStartDate: '',
    studyEndDate: '',
    isCurrentlyStudying: false,
  });
  const [cookies, setCookie] = useCookies(['jwt']); // Utiliser useCookies
  const navigate = useNavigate(); // Utiliser useNavigate
  const [loading, setLoading] = useState(false); // État pour le chargement
  const [error, setError] = useState(null); // État pour les erreurs

  const handleNext = () => {
    // TODO: Ajouter la logique de validation pour chaque étape ici
    // Pour l'instant, on passe juste à l'étape suivante
    setError(null); // Réinitialiser l'erreur à chaque étape suivante
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setError(null); // Réinitialiser l'erreur en revenant en arrière
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFormChange = (data) => {
    setFormData(prevData => ({ ...prevData, ...data }));
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create FormData object to handle file upload
      const formDataToSend = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'cv' && formData[key] instanceof File) {
          console.log('Adding CV to form data:', {
            name: formData[key].name,
            type: formData[key].type,
            size: formData[key].size
          });
          formDataToSend.append('cv', formData[key]);
        } else if (Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Log the FormData contents
      for (let pair of formDataToSend.entries()) {
        console.log('FormData entry:', pair[0], pair[1]);
      }

      // Send the form data
      const response = await axios.post('http://localhost:3000/api/auth/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status) {
        console.log('Registration successful:', response.data);
        setCookie('jwt', response.data.token, { path: '/', maxAge: 3600 * 24 * 7 });
        navigate('/');
      } else {
        setError(response.data.message || 'Registration failed.');
        console.error('Registration failed:', response.data.message);
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response) {
        setError(err.response.data.message || `Server error (${err.response.status}).`);
      } else if (err.request) {
        setError('Unable to connect to the registration server.');
      } else {
        setError('Error setting up registration request.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <Step1Form formData={formData} onFormChange={handleFormChange} />;
      case 1:
        return <Step2Form formData={formData} onFormChange={handleFormChange} />;
      case 2:
        return <Step3Form formData={formData} onFormChange={handleFormChange} />;
      case 3:
        return <Step4Form formData={formData} onFormChange={handleFormChange} />;
      default:
        return 'Étape inconnue';
    }
  };

  return (
    <div className="auth-page"> {/* Wrapper principal comme dans login.jsx */}
      <Header /> {/* Le header reste en dehors du conteneur principal d'auth */}
      <div className="auth-container"> {/* Conteneur centré comme dans login.jsx */}
        <div className="auth-card"> {/* La carte visuelle comme dans login.jsx */}
          <div className="auth-header"> {/* Header pour le titre et sous-titre */}
             <Typography variant="h4" component="h1" align="center" sx={{ mb: 1 }} className="auth-title"> {/* Appliquer classe et ajuster marge */}
              Inscription
            </Typography>
             <Typography variant="body1" align="center" sx={{ mb: 4 }} className="auth-subtitle"> {/* Appliquer classe et ajuster marge */}
              Veuillez remplir les informations pour créer votre compte
            </Typography>
          </div>

          {/* Le Stepper n'a pas de classe auth correspondante, utiliser sx pour le style */}
          <Box sx={{ width: '100%', mb: 3 }}> {/* Ajuster la largeur et la marge du stepper */}
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              // Appliquer des styles pour rendre le stepper noir et blanc
              sx={{
                // Couleur du texte de l'étape (numéro et label)
                '& .MuiStepLabel-root .Mui-completed': { color: '#000' }, // Étapes complétées en noir
                '& .MuiStepLabel-root .Mui-active': { color: '#000' }, // Étape active en noir
                '& .MuiStepLabel-root .Mui-disabled': { color: 'grey' }, // Étapes désactivées en gris
                
                // Couleur de l'icône de l'étape (le cercle)
                '& .MuiStepIcon-root .Mui-completed': { color: '#000' }, // Icône complétée en noir
                '& .MuiStepIcon-root .Mui-active': { color: '#000' }, // Icône active en noir
                '& .MuiStepIcon-root .Mui-disabled': { color: 'lightgrey' }, // Icône désactivée en gris clair
                
                // Couleur de la ligne de connexion entre les étapes
                '& .MuiStepConnector-line': { borderColor: 'lightgrey' }, // Ligne en gris clair
                '& .MuiStepConnector-root .Mui-active .MuiStepConnector-line': { borderColor: '#000' }, // Ligne active en noir
                '& .MuiStepConnector-root .Mui-completed .MuiStepConnector-line': { borderColor: '#000' }, // Ligne complétée en noir
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box sx={{ width: '100%' }}> {/* Conteneur pour le contenu de l'étape et les boutons */}
            {activeStep === steps.length ? (
              <Box sx={{ textAlign: 'center' }}> {/* Centrer le contenu final */}
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Votre inscription est terminée. Merci !
                </Typography>
                {/* Afficher l'erreur si elle existe */}
                {error && (
                  <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                )}
                <Button 
                  variant="contained" 
                  onClick={handleFinalSubmit} 
                  disabled={loading}
                  className="auth-button" // Appliquer la classe du bouton
                  // Appliquer des styles pour rendre le bouton noir et blanc avec bordure
                  sx={{
                    backgroundColor: '#000', // Fond noir
                    color: '#fff', // Texte blanc
                    border: '1px solid #000', // Bordure noire
                    '&:hover': { // Styles au survol
                      backgroundColor: '#fff', // Fond blanc au survol
                      color: '#000', // Texte noir au survol
                      borderColor: '#000', // Bordure noire au survol
                    },
                  }}
                > 
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Enregistrement...
                    </>
                  ) : (
                    'Terminer et Se Connecter'
                  )}
                </Button>
              </Box>
            ) : (
              <Box className="auth-form" sx={{ width: '100%' }}> {/* Appliquer la classe auth-form et largeur */}
                {/* Afficher l'erreur si elle existe pour l'étape courante */}
                {error && (
                  <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                )}
                {getStepContent(activeStep)}
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 3, justifyContent: 'space-between' }}> {/* Ajuster padding et justification */}
                  <Button
                    color="inherit"
                    disabled={activeStep === 0 || loading}
                    onClick={handleBack}
                    className="auth-button-secondary" // Appliquer une classe secondaire si besoin
                  >
                    Précédent
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleNext} 
                    disabled={loading}
                     className="auth-button" // Appliquer la classe du bouton
                    // Appliquer des styles pour rendre le bouton noir et blanc avec bordure
                    sx={{
                      backgroundColor: '#000', // Fond noir
                      color: '#fff', // Texte blanc
                      border: '1px solid #000', // Bordure noire
                      '&:hover': { // Styles au survol
                        backgroundColor: '#fff', // Fond blanc au survol
                        color: '#000', // Texte noir au survol
                        borderColor: '#000', // Bordure noire au survol
                      },
                    }}
                  >
                    {activeStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </div>
      </div>
    </div>
  );
};

export default RegistrationWorkflow; 
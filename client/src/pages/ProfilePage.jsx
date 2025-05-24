import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper, 
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Fade,
  Stack,
  alpha,
  Modal,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LightbulbOutlineIcon from '@mui/icons-material/LightbulbOutline';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cookies] = useCookies(['jwt']);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showAddExperienceForm, setShowAddExperienceForm] = useState(false);
  const [openLanguageModal, setOpenLanguageModal] = useState(false);
  const [newLanguage, setNewLanguage] = useState({
    name: '',
    level: ''
  });

  // Nouvel état pour la modale de certification
  const [openCertificationModal, setOpenCertificationModal] = useState(false);
  const [newCertification, setNewCertification] = useState({
    name: '',
    authority: '',
    date: ''
  });

  // Ref pour l'input de fichier caché
  const fileInputRef = React.useRef(null);

  // Ajouter ces états pour gérer le menu du CV
  const [cvMenuAnchor, setCvMenuAnchor] = useState(null);
  const [cvFileInputRef] = useState(React.createRef());

  // Ajouter ces états dans le composant ProfilePage
  const [openCvAnalysis, setOpenCvAnalysis] = useState(false);
  const [cvAnalysis, setCvAnalysis] = useState(null);

  const languages = [
    'Français', 'Anglais', 'Arabe', 'Allemand', 'Espagnol', 'Italien', 
    'Portugais', 'Russe', 'Chinois', 'Japonais', 'Coréen'
  ];

  const languageLevels = [
    { value: 'A1', label: 'A1 - Débutant' },
    { value: 'A2', label: 'A2 - Élémentaire' },
    { value: 'B1', label: 'B1 - Intermédiaire' },
    { value: 'B2', label: 'B2 - Intermédiaire avancé' },
    { value: 'C1', label: 'C1 - Avancé' },
    { value: 'C2', label: 'C2 - Maîtrise' }
  ];

  // Définir la fonction fetchUserData en dehors de useEffect
  const fetchUserData = async () => {
    if (!cookies.jwt) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

      try {
      const response = await axios.get('http://localhost:3000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${cookies.jwt}`
        },
        withCredentials: true
      });
      setUserData(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des données utilisateur:', err);
      if (err.response) {
        setError(err.response.data.message || `Erreur serveur (${err.response.status}).`);
        if (err.response.status === 401) {
          navigate('/login');
        }
      } else if (err.request) {
        setError('Impossible de se connecter au serveur.');
      } else {
        setError('Erreur lors de la configuration de la requête.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [cookies.jwt, navigate]);

  useEffect(() => {
    if (userData) {
      const fields = [
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.governorate,
        userData.mobileNumber,
        userData.diplomaSpecialty,
        userData.university,
        userData.yearsOfExperience,
        userData.employmentTypes?.length > 0,
        userData.selectedDomains?.length > 0,
        userData.cv
      ];
      const completedFields = fields.filter(Boolean).length;
      setProfileCompletion((completedFields / fields.length) * 100);
    }
  }, [userData]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    handleMenuClose();
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleDownloadCV = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/auth/cv/${userData._id}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${cookies.jwt}`
        },
        withCredentials: true
      });
      
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
  };

  const cleanArrayData = (data) => {
    if (!data) return '';
    if (typeof data === 'string') {
      try {
        const parsedData = JSON.parse(data);
        if (Array.isArray(parsedData)) {
          return parsedData.join(' ');
        }
        return data;
      } catch (e) {
        return data.replace(/[\[\]"]/g, '').replace(/,/g, ' ');
      }
    }
    if (Array.isArray(data)) {
      return data.join(' ');
    }
    return '';
  };

  const employmentTypeConfig = {
    'CDI': { icon: <WorkOutlineIcon />, color: '#4caf50', label: 'CDI' },
    'CDD': { icon: <AssignmentIcon />, color: '#2196f3', label: 'CDD' },
    'Temps partiel': { icon: <AccessTimeIcon />, color: '#ff9800', label: 'Temps partiel' },
    'Freelancer': { icon: <BusinessCenterIcon />, color: '#9c27b0', label: 'Freelancer' },
    'Saisonnier': { icon: <CalendarTodayIcon />, color: '#f44336', label: 'Saisonnier' }
  };

  const handleOpenLanguageModal = () => {
    setOpenLanguageModal(true);
  };

  const handleCloseLanguageModal = () => {
    setOpenLanguageModal(false);
    setNewLanguage({ name: '', level: '' });
  };

  const handleLanguageChange = (event) => {
    const { name, value } = event.target;
    setNewLanguage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddLanguage = async () => {
    try {
      console.log("Envoi de la requête pour ajouter la langue:", newLanguage);
      const response = await fetch('http://localhost:3000/api/auth/profile/languages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.jwt}`
        },
        body: JSON.stringify(newLanguage),
        credentials: 'include'
      });

      const data = await response.json();
      console.log("Réponse du serveur:", data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to add language');
      }

      // Mettre à jour les données utilisateur avec les nouvelles langues
      setUserData(prevData => ({
        ...prevData,
        languages: data.languages
      }));
      
      handleCloseLanguageModal();
    } catch (error) {
      console.error('Erreur détaillée lors de l\'ajout de la langue:', error);
      setError(error.message || 'Erreur lors de l\'ajout de la langue');
    }
  };

  // Ajouter cette fonction pour obtenir la couleur du niveau
  const getLevelColor = (level) => {
    const colors = {
      'A1': '#FF9800', // Orange
      'A2': '#FFA726', // Orange clair
      'B1': '#4CAF50', // Vert
      'B2': '#2196F3', // Bleu
      'C1': '#9C27B0', // Violet
      'C2': '#D32F2F'  // Rouge
    };
    return colors[level] || '#757575';
  };

  const handleOpenCertificationModal = () => {
    setOpenCertificationModal(true);
  };

  const handleCloseCertificationModal = () => {
    setOpenCertificationModal(false);
    setNewCertification({ name: '', authority: '', date: '' });
  };

  const handleCertificationChange = (event) => {
    const { name, value } = event.target;
    setNewCertification(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCertification = async () => {
    try {
      console.log("Envoi de la requête pour ajouter la certification:", newCertification);
      const response = await fetch('http://localhost:3000/api/auth/profile/certifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.jwt}`
        },
        body: JSON.stringify(newCertification),
        credentials: 'include'
      });

      const data = await response.json();
      console.log("Réponse du serveur:", data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to add certification');
      }

      // Mettre à jour les données utilisateur avec les nouvelles certifications
      setUserData(prevData => ({
        ...prevData,
        certifications: data.certifications
      }));
      
      handleCloseCertificationModal();
    } catch (error) {
      console.error('Erreur détaillée lors de l\'ajout de la certification:', error);
      setError(error.message || 'Erreur lors de l\'ajout de la certification');
    }
  };

  // Fonction pour gérer la sélection de fichier
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.log('Aucun fichier sélectionné');
      return;
    }

    // Vérifications préliminaires
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image (jpg, png, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB');
      return;
    }

    console.log('Fichier sélectionné:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });

    const formData = new FormData();
    formData.append('profilePicture', file);

    // Vérifier le contenu de FormData
    console.log('Contenu de FormData:');
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1] instanceof File ? {
        name: pair[1].name,
        type: pair[1].type,
        size: pair[1].size
      } : pair[1]);
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Envoi de la requête au serveur...');
      const response = await axios({
        method: 'patch',
        url: 'http://localhost:3000/api/auth/profile/picture',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${cookies.jwt}`
        },
        withCredentials: true
      });

      console.log('Réponse du serveur:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });

      if (response.data.profilePicture) {
        // Mettre à jour directement l'image dans l'état local
        setUserData(prevData => ({
          ...prevData,
          profilePicture: response.data.profilePicture
        }));
      } else {
        // Si l'image n'est pas dans la réponse, recharger toutes les données
        await fetchUserData();
      }
      
    } catch (err) {
      console.error('Erreur détaillée lors de l\'upload:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
          headers: err.response.headers
        } : 'Pas de réponse du serveur',
        request: err.request ? {
          method: err.request.method,
          url: err.request.url,
          headers: err.request.headers
        } : 'Pas de requête envoyée'
      });
      
      setError(
        err.response?.data?.message || 
        err.message || 
        'Erreur lors de l\'upload de la photo de profil'
      );
    } finally {
      setLoading(false);
    }
  };

  // Ajouter cette fonction utilitaire au début du composant
  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Modifier la partie qui affiche l'image
  const renderProfileImage = () => {
    if (!userData?.profilePicture?.data) {
      return (
        <Avatar
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: 'primary.main',
            fontSize: '3rem'
          }}
        >
          {userData?.firstName?.[0]}{userData?.lastName?.[0]}
        </Avatar>
      );
    }

    try {
      const base64String = arrayBufferToBase64(userData.profilePicture.data);
      return (
        <img
          src={`data:${userData.profilePicture.contentType};base64,${base64String}`}
          alt="Profile"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'all 0.3s ease'
          }}
        />
      );
    } catch (error) {
      console.error('Error rendering profile image:', error);
      return (
        <Avatar
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: 'error.main',
            fontSize: '3rem'
          }}
        >
          !
        </Avatar>
      );
    }
  };

  // Ajouter ces fonctions pour gérer le CV
  const handleCvMenuOpen = (event) => {
    setCvMenuAnchor(event.currentTarget);
  };

  const handleCvMenuClose = () => {
    setCvMenuAnchor(null);
  };

  const handleCvFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.log('Aucun fichier sélectionné');
      return;
    }

    // Vérifications préliminaires
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setError('Le fichier doit être au format PDF ou Word');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 5MB');
      return;
    }

    console.log('Fichier CV sélectionné:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });

    const formData = new FormData();
    formData.append('cv', file);

    try {
      setLoading(true);
      setError(null);
      
      console.log('Envoi de la requête au serveur...');
      const response = await axios({
        method: 'patch',
        url: 'http://localhost:3000/api/auth/profile/cv',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${cookies.jwt}`
        },
        withCredentials: true
      });

      console.log('Réponse du serveur:', response.data);

      if (response.data.status) {
        // Mettre à jour les données utilisateur
        await fetchUserData();
        setError(null);
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'upload du CV');
      }
    } catch (err) {
      console.error('Erreur détaillée lors de l\'upload du CV:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      setError(
        err.response?.data?.message || 
        err.message || 
        'Erreur lors de l\'upload du CV'
      );
    } finally {
      setLoading(false);
      handleCvMenuClose();
    }
  };

  const handleDeleteCV = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre CV ?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete('http://localhost:3000/api/auth/profile/cv', {
        headers: {
          'Authorization': `Bearer ${cookies.jwt}`
        },
        withCredentials: true
      });

      if (response.data.status) {
        await fetchUserData(); // Recharger les données utilisateur
        setError(null);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression du CV:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression du CV');
    } finally {
      setLoading(false);
      handleCvMenuClose();
    }
  };

  const handleOpenCvAnalysis = async () => {
    try {
      console.log("Vérification du CV...", userData?.cv);
      
      if (!userData?.cv) {
        setError("Aucun CV n'a été téléchargé. Veuillez d'abord télécharger un CV.");
        return;
      }

      setLoading(true);
      const formData = new FormData();

      // Récupérer le CV depuis le serveur
      try {
        const cvResponse = await axios.get(`http://localhost:3000/api/auth/cv/${userData._id}`, {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${cookies.jwt}`
          },
          withCredentials: true
        });

        // Créer un fichier à partir du blob
        const cvFile = new File([cvResponse.data], userData.cv.fileName, {
          type: cvResponse.headers['content-type']
        });
        
        formData.append('file', cvFile);
      } catch (err) {
        console.error("Erreur lors de la récupération du CV:", err);
        setError("Erreur lors de la récupération du CV. Veuillez réessayer.");
        return;
      }

      console.log("Envoi du CV pour analyse...");
      const response = await axios.post('http://localhost:8080/analyze-cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("Réponse de l'analyse:", response.data);

      if (response.data.status === 'success') {
        setCvAnalysis(response.data.cv.analysis);
        setOpenCvAnalysis(true);
      } else {
        setError("Erreur lors de l'analyse du CV");
      }
    } catch (err) {
      console.error('Erreur lors de l\'analyse du CV:', err);
      setError(err.response?.data?.detail || "Erreur lors de l'analyse du CV");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCvAnalysis = () => {
    setOpenCvAnalysis(false);
    setCvAnalysis(null);
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: darkMode ? '#0a0a0a' : '#f5f7fa'
      }}>
        <Stack spacing={3} alignItems="center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          >
            <CircularProgress size={80} thickness={5} sx={{ color: '#1976d2' }} />
          </motion.div>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            Chargement du profil...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: darkMode ? '#0a0a0a' : '#f5f7fa'
      }}>
        <Alert 
          severity="error" 
          sx={{ 
            maxWidth: 500, 
            width: '100%', 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            p: 3
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>Erreur</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: darkMode ? '#0a0a0a' : '#f5f7fa',
      transition: 'background-color 0.4s ease'
    }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 6, pt: '120px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* Action Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 5,
              borderRadius: 3,
              bgcolor: darkMode ? alpha('#fff', 0.08) : '#fff',
              backdropFilter: 'blur(12px)',
              border: '1px solid',
              borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08),
              boxShadow: '0 4px 30px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={handleThemeToggle}
                      icon={<Brightness7Icon sx={{ color: '#ffb300' }} />}
                      checkedIcon={<Brightness4Icon sx={{ color: '#90caf9' }} />}
                      sx={{
                        '& .MuiSwitch-track': {
                          bgcolor: darkMode ? '#90caf9' : '#ffb300'
                        }
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {darkMode ? "Mode sombre" : "Mode clair"}
                    </Typography>
                  }
                />
                <Tooltip title="Partager le profil">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <IconButton
                      onClick={handleShareProfile}
                      sx={{
                        bgcolor: darkMode ? alpha('#fff', 0.12) : alpha('#1976d2', 0.1),
                        color: '#1976d2',
                        '&:hover': {
                          bgcolor: darkMode ? alpha('#fff', 0.2) : alpha('#1976d2', 0.2)
                        }
                      }}
                    >
                      <ShareIcon />
                    </IconButton>
                  </motion.div>
                </Tooltip>
              </Stack>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{
                  bgcolor: darkMode ? alpha('#fff', 0.05) : alpha('#1976d2', 0.05),
                  px: 3,
                  py: 1.5,
                  borderRadius: 8
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, color: darkMode ? '#90caf9' : '#1976d2' }}>
                  Profil complété
                </Typography>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 180 }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                >
                  <LinearProgress
                    variant="determinate"
                    value={profileCompletion}
                    sx={{
                      width: 180,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: profileCompletion === 100 ? '#4caf50' : '#1976d2',
                        borderRadius: 4,
                        transition: 'width 0.5s ease'
                      }
                    }}
                  />
                </motion.div>
                <Typography variant="body2" sx={{ fontWeight: 600, color: darkMode ? '#fff' : '#1976d2' }}>
                  {Math.round(profileCompletion)}%
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {/* Main Grid Layout */}
          <Grid container spacing={4}>
            {/* Sidebar */}
            <Grid item xs={12} md={3}>
              <Stack spacing={4}>
                {/* Profile Card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: darkMode ? alpha('#fff', 0.08) : '#fff',
                    border: '1px solid',
                    borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08),
                    boxShadow: '0 8px 40px rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 50px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Stack spacing={3} alignItems="center">
                    {/* Input de fichier caché */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Box
                        onClick={() => {
                          console.log('Avatar clicked');
                          if (fileInputRef.current) {
                            console.log('Triggering file input click');
                            fileInputRef.current.click();
                          } else {
                            console.log('fileInputRef is not available');
                          }
                        }}
                        sx={{
                          position: 'relative',
                          width: 150,
                          height: 150,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          '&:hover': {
                            '& .overlay': {
                              opacity: 1
                            },
                            '& img': {
                              transform: 'scale(1.1)',
                              opacity: 0.8
                            }
                          }
                        }}
                      >
                        {userData?.profilePicture ? (
                          <img
                            src={userData.profilePicture}
                            alt={`${userData.firstName} ${userData.lastName}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        ) : (
                          <Avatar
                            sx={{
                              width: '100%',
                              height: '100%',
                              bgcolor: '#1976d2',
                              fontSize: '3rem'
                            }}
                          >
                            {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                          </Avatar>
                        )}
                        <Box
                          className="overlay"
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            textAlign: 'center',
                            py: 0.5,
                            fontSize: '0.75rem',
                            opacity: 0,
                            transition: 'opacity 0.3s ease'
                          }}
                        >
                          Changer la photo
                        </Box>
                      </Box>
                    </motion.div>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: darkMode ? '#fff' : '#1a1a1a',
                          textAlign: 'center'
                        }}
                      >
                        {userData?.firstName} {userData?.lastName}
                      </Typography>
                      <Tooltip title="Modifier le nom">
                        <IconButton size="small" sx={{ color: '#1976d2' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Chip
                      label={userData?.desiredJobTitle || 'Étudiant(e) à la recherche d\'un stage'}
                      sx={{
                        bgcolor: darkMode ? alpha('#1976d2', 0.2) : alpha('#1976d2', 0.1),
                        color: darkMode ? '#90caf9' : '#1976d2',
                        fontWeight: 500,
                        px: 2,
                        py: 0.5,
                        borderRadius: 16
                      }}
                    />
                  </Stack>
                </Paper>

                {/* Experience Summary */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: darkMode ? alpha('#fff', 0.08) : '#fff',
                    border: '1px solid',
                    borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08),
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? '#fff' : '#1a1a1a' }}>
                      Expérience
                    </Typography>
                    <Tooltip title="Modifier l'expérience">
                      <IconButton size="small" sx={{ color: '#1976d2' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Divider sx={{ my: 2, borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08) }} />
                  <Typography variant="body1" sx={{ color: darkMode ? '#e0e0e0' : '#4a4a4a' }}>
                    {userData?.yearsOfExperience ? `${userData.yearsOfExperience} an(s)` : 'Non spécifié'}
                  </Typography>
                </Paper>

                {/* Social Links */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: darkMode ? alpha('#fff', 0.08) : '#fff',
                    border: '1px solid',
                    borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08),
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? '#fff' : '#1a1a1a' }}>
                      Liens Sociaux
                    </Typography>
                    <Button 
                      size="small" 
                      startIcon={<AddIcon />} 
                      sx={{ 
                        color: '#1976d2',
                        fontWeight: 500,
                        textTransform: 'none'
                      }}
                    >
                      Ajouter
                    </Button>
                  </Stack>
                  <Divider sx={{ my: 2, borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08) }} />
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Tooltip title="LinkedIn">
                      <IconButton 
                        sx={{ 
                          color: '#0a66c2',
                          '&:hover': { bgcolor: alpha('#0a66c2', 0.1) }
                        }}
                      >
                        <LinkedInIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="GitHub">
                      <IconButton 
                        sx={{ 
                          color: '#181717',
                          '&:hover': { bgcolor: alpha('#181717', 0.1) }
                        }}
                      >
                        <GitHubIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Instagram">
                      <IconButton 
                        sx={{ 
                          color: '#E4405F',
                          '&:hover': { bgcolor: alpha('#E4405F', 0.1) }
                        }}
                      >
                        <InstagramIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Twitter">
                      <IconButton 
                        sx={{ 
                          color: '#1DA1F2',
                          '&:hover': { bgcolor: alpha('#1DA1F2', 0.1) }
                        }}
                      >
                        <TwitterIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Paper>

                {/* CV Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: darkMode ? alpha('#fff', 0.08) : '#fff',
                    border: '1px solid',
                    borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08),
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: alpha('#1976d2', 0.1),
                          transition: 'all 0.3s ease',
                          '&:hover': { bgcolor: alpha('#1976d2', 0.2) }
                        }}>
                          <DownloadIcon sx={{ color: '#1976d2' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? '#fff' : '#1a1a1a' }}>
                          CV
                        </Typography>
                      </Stack>
                      {userData?.cv?.fileName && (
                        <IconButton 
                          onClick={handleCvMenuOpen}
                          sx={{ 
                            color: darkMode ? alpha('#fff', 0.7) : alpha('#000', 0.5),
                            '&:hover': { color: '#1976d2' }
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      )}
                    </Stack>
                    <Divider sx={{ borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08) }} />
                    
                    {userData?.cv?.fileName ? (
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Voir l'analyse du CV">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <IconButton 
                              onClick={handleOpenCvAnalysis}
                              sx={{ 
                                color: '#1976d2',
                                bgcolor: alpha('#1976d2', 0.1),
                                '&:hover': { bgcolor: alpha('#1976d2', 0.2) }
                              }}
                            >
                              <AssessmentIcon />
                            </IconButton>
                          </motion.div>
                        </Tooltip>
                        <Tooltip title="Télécharger le CV">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <IconButton 
                              onClick={handleDownloadCV} 
                              sx={{ 
                                color: '#1976d2',
                                bgcolor: alpha('#1976d2', 0.1),
                                '&:hover': { bgcolor: alpha('#1976d2', 0.2) }
                              }}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </motion.div>
                        </Tooltip>
                        {!userData.cv.data && (
                          <Tooltip title="Télécharger à nouveau le CV">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                              <IconButton 
                                onClick={() => cvFileInputRef.current?.click()}
                                sx={{ 
                                  color: '#ff9800',
                                  bgcolor: alpha('#ff9800', 0.1),
                                  '&:hover': { bgcolor: alpha('#ff9800', 0.2) }
                                }}
                              >
                                <AddIcon />
                              </IconButton>
                            </motion.div>
                          </Tooltip>
                        )}
                      </Stack>
                    ) : (
                      <Stack spacing={2}>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => cvFileInputRef.current?.click()}
                          sx={{
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': {
                              borderColor: '#1976d2',
                              bgcolor: alpha('#1976d2', 0.1)
                            }
                          }}
                        >
                          Ajouter un CV
                        </Button>
                        <Typography variant="caption" sx={{ color: darkMode ? alpha('#fff', 0.7) : alpha('#000', 0.6) }}>
                          Formats acceptés : PDF, DOC, DOCX (max 5MB)
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Paper>

                {/* Input caché pour l'upload de CV */}
                <input
                  type="file"
                  ref={cvFileInputRef}
                  onChange={handleCvFileChange}
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                />

                {/* Menu pour les actions du CV - uniquement visible si un CV existe */}
                {userData?.cv?.fileName && (
                  <Menu
                    anchorEl={cvMenuAnchor}
                    open={Boolean(cvMenuAnchor)}
                    onClose={handleCvMenuClose}
                    TransitionComponent={Fade}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        mt: 1.5,
                        borderRadius: 3,
                        bgcolor: darkMode ? alpha('#fff', 0.08) : '#fff',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid',
                        borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08),
                        boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
                        '& .MuiMenuItem-root': {
                          px: 3,
                          py: 1.5,
                          color: darkMode ? '#e0e0e0' : '#4a4a4a',
                          '&:hover': {
                            bgcolor: darkMode ? alpha('#1976d2', 0.2) : alpha('#1976d2', 0.1)
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem onClick={() => {
                      handleCvMenuClose();
                      cvFileInputRef.current?.click();
                    }}>
                      <EditIcon sx={{ mr: 2, color: '#1976d2' }} />
                      Changer le CV
                    </MenuItem>
                    <MenuItem onClick={handleDeleteCV} sx={{ color: '#d32f2f' }}>
                      <DeleteIcon sx={{ mr: 2, color: '#d32f2f' }} />
                      Supprimer le CV
                    </MenuItem>
                  </Menu>
                )}

                {/* Contact Information */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: darkMode ? alpha('#fff', 0.08) : '#fff',
                    border: '1px solid',
                    borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08),
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? '#fff' : '#1a1a1a' }}>
                      Informations
                    </Typography>
                    <Tooltip title="Modifier les informations">
                      <IconButton size="small" sx={{ color: '#1976d2' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Divider sx={{ my: 2, borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08) }} />
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <EmailIcon sx={{ color: '#1976d2' }} fontSize="small" />
                      <Typography variant="body2" sx={{ color: darkMode ? '#e0e0e0' : '#4a4a4a' }}>
                        {userData?.email}
                      </Typography>
                    </Stack>
                    {userData?.mobileNumber && (
                      <Stack direction="row" spacing={2} alignItems="center">
                        <PhoneIcon sx={{ color: '#1976d2' }} fontSize="small" />
                        <Typography variant="body2" sx={{ color: darkMode ? '#e0e0e0' : '#4a4a4a' }}>
                          {userData.mobileNumber}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Paper>

                {/* Address */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: darkMode ? alpha('#fff', 0.08) : '#fff',
                    border: '1px solid',
                    borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08),
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? '#fff' : '#1a1a1a' }}>
                      Adresse
                    </Typography>
                    <Tooltip title="Modifier l'adresse">
                      <IconButton size="small" sx={{ color: '#1976d2' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Divider sx={{ my: 2, borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08) }} />
                  <Stack spacing={1.5}>
                    <Typography variant="body2" sx={{ color: darkMode ? '#e0e0e0' : '#4a4a4a' }}>
                      Pays: {userData?.country || 'Non spécifié'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: darkMode ? '#e0e0e0' : '#4a4a4a' }}>
                      Région: {userData?.governorate || 'Non spécifiée'}
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>

            {/* Main Content */}
            <Grid item xs={12} md={9}>
              <Stack spacing={4}>
             

                {/* Education */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: darkMode ? alpha('#fff', 0.08) : '#fff',
                    border: '1px solid',
                    borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08),
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="h5" sx={{ fontWeight: 600, color: darkMode ? '#fff' : '#1a1a1a' }}>
                      Etudes / Parcours universitaire
                    </Typography>
                    <Tooltip title="Ajouter une formation">
                      <motion.dev whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        {/* <IconButton 
                          sx={{ 
                            color: '#1976d2',
                            bgcolor: alpha('#1976d2', 0.1),
                            '&:hover': { bgcolor: alpha('#1976d2', 0.2) }
                          }}
                        >
                          <AddIcon />
                        </IconButton> */}
                      </motion.dev>
                    </Tooltip>
                  </Stack>
                  <Divider sx={{ my: 3, borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08) }} />
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: darkMode ? '#90caf9' : '#1976d2', mb: 0.5 }}>
                        Diplôme/Spécialité
                      </Typography>
                      <Typography variant="body1" sx={{ color: darkMode ? '#e0e0e0' : '#4a4a4a' }}>
                        {userData?.diplomaSpecialty || 'Non spécifié'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: darkMode ? '#90caf9' : '#1976d2', mb: 0.5 }}>
                        Université
                      </Typography>
                      <Typography variant="body1" sx={{ color: darkMode ? '#e0e0e0' : '#4a4a4a' }}>
                        {userData?.university || 'Non spécifiée'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: darkMode ? '#90caf9' : '#1976d2', mb: 0.5 }}>
                        Période
                      </Typography>
                      <Typography variant="body1" sx={{ color: darkMode ? '#e0e0e0' : '#4a4a4a' }}>
                        {new Date(userData?.studyStartDate).toLocaleDateString()} -
                        {userData?.isCurrentlyStudying
                          ? ' Présent'
                          : new Date(userData?.studyEndDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                {/* TODO: Add Types d'emploi recherchés / Domaines d'intérêt (as per image, maybe small cards) */}

           
                
                 {/* Section Langues */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: darkMode ? alpha('#fff', 0.05) : '#fff',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                    }}
                  >
                     <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                       <Typography variant="h6" sx={{ color: darkMode ? 'white' : 'inherit' }}>Langues</Typography>
                       <Button 
                         size="small" 
                         startIcon={<AddIcon />} 
                         onClick={handleOpenLanguageModal}
                       >
                         Ajouter une Langue
                       </Button>
                     </Stack>
                      <Divider sx={{ my: 2, borderColor: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1) }} />

                      {userData?.languages && userData.languages.length > 0 ? (
                        <Stack spacing={2}>
                          {userData.languages.map((language, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 2,
                                borderRadius: 2,
                                bgcolor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  bgcolor: darkMode ? alpha('#fff', 0.08) : alpha('#000', 0.04),
                                }
                              }}
                            >
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography 
                                  variant="subtitle1" 
                                  sx={{ 
                                    fontWeight: 500,
                                    color: darkMode ? '#fff' : '#1a1a1a'
                                  }}
                                >
                                  {language.name}
                                </Typography>
                                <Chip
                                  label={language.level}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(getLevelColor(language.level), 0.1),
                                    color: getLevelColor(language.level),
                                    fontWeight: 600,
                                    '& .MuiChip-label': {
                                      px: 1
                                    }
                                  }}
                                />
                              </Stack>
                              <IconButton 
                                size="small" 
                                sx={{ 
                                  color: darkMode ? alpha('#fff', 0.7) : alpha('#000', 0.5),
                                  '&:hover': {
                                    color: '#1976d2'
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Box
                          sx={{
                            py: 3,
                            textAlign: 'center',
                            color: darkMode ? alpha('#fff', 0.5) : alpha('#000', 0.5)
                          }}
                        >
                          <Typography variant="body2">
                            Aucune langue ajoutée pour le moment
                          </Typography>
                        </Box>
                      )}
                  </Paper>

                 {/* Section Certifications */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: darkMode ? alpha('#fff', 0.05) : '#fff',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                    }}
                  >
                     <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                       <Typography variant="h6" sx={{ color: darkMode ? 'white' : 'inherit' }}>Certifications</Typography>
                       <Button size="small" startIcon={<AddIcon />} onClick={handleOpenCertificationModal}>
                         Ajouter une Certification
                       </Button>
                     </Stack>
                      <Divider sx={{ my: 2, borderColor: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1) }} />

                      {userData?.certifications && userData.certifications.length > 0 ? (
                        <Stack spacing={2}>
                          {userData.certifications.map((certification, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 2,
                                borderRadius: 2,
                                bgcolor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  bgcolor: darkMode ? alpha('#fff', 0.08) : alpha('#000', 0.04),
                                }
                              }}
                            >
                              <Stack spacing={0.5}>
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 500,
                                    color: darkMode ? '#fff' : '#1a1a1a'
                                  }}
                                >
                                  {certification.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: darkMode ? alpha('#fff', 0.7) : '#4a4a4a' }}>
                                  Organisme: {certification.issuer}
                                </Typography>
                                <Typography variant="body2" sx={{ color: darkMode ? alpha('#fff', 0.7) : '#4a4a4a' }}>
                                  Date: {new Date(certification.date).toLocaleDateString()}
                                </Typography>
                              </Stack>
                              <IconButton
                                size="small"
                                sx={{
                                  color: darkMode ? alpha('#fff', 0.7) : alpha('#000', 0.5),
                                  '&:hover': {
                                    color: '#1976d2'
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Box
                          sx={{
                            py: 3,
                            textAlign: 'center',
                            color: darkMode ? alpha('#fff', 0.5) : alpha('#000', 0.5)
                          }}
                        >
                          <Typography variant="body2">
                            Aucune certification ajoutée pour le moment
                          </Typography>
                        </Box>
                      )}
                  </Paper>

               
              </Stack>
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            borderRadius: 3,
            bgcolor: darkMode ? alpha('#fff', 0.08) : '#fff',
            backdropFilter: 'blur(12px)',
            border: '1px solid',
            borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08),
            boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
            '& .MuiMenuItem-root': {
              px: 3,
              py: 1.5,
              color: darkMode ? '#e0e0e0' : '#4a4a4a',
              '&:hover': {
                bgcolor: darkMode ? alpha('#1976d2', 0.2) : alpha('#1976d2', 0.1)
              }
            }
          }
        }}
      >
        <MenuItem onClick={handleShareProfile}>
          <ShareIcon sx={{ mr: 2, color: '#1976d2' }} />
          Partager le profil
        </MenuItem>
        <MenuItem>
          <LinkedInIcon sx={{ mr: 2, color: '#1976d2' }} />
          Ajouter LinkedIn
        </MenuItem>
        <MenuItem>
          <GitHubIcon sx={{ mr: 2, color: '#1976d2' }} />
          Ajouter GitHub
        </MenuItem>
      </Menu>

      {/* Modal pour ajouter une langue */}
      <Dialog 
        open={openLanguageModal} 
        onClose={handleCloseLanguageModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: darkMode ? 'background.paper' : 'background.default',
          color: darkMode ? 'white' : 'inherit'
        }}>
          Ajouter une langue
        </DialogTitle>
        <DialogContent sx={{ 
          bgcolor: darkMode ? 'background.paper' : 'background.default',
          pt: 2
        }}>
          <Stack spacing={3}>
            <TextField
              select
              label="Langue"
              name="name"
              value={newLanguage.name}
              onChange={handleLanguageChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            >
              {languages.map((language) => (
                <MenuItem key={language} value={language}>
                  {language}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Niveau"
              name="level"
              value={newLanguage.level}
              onChange={handleLanguageChange}
              fullWidth
              required
            >
              {languageLevels.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: darkMode ? 'background.paper' : 'background.default',
          px: 3,
          py: 2
        }}>
          <Button onClick={handleCloseLanguageModal} color="inherit">
            Annuler
          </Button>
          <Button 
            onClick={handleAddLanguage} 
            variant="contained" 
            disabled={!newLanguage.name || !newLanguage.level}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nouvelle Modale pour ajouter une certification */}
      <Dialog 
        open={openCertificationModal} 
        onClose={handleCloseCertificationModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          bgcolor: darkMode ? 'background.paper' : 'background.default',
          color: darkMode ? 'white' : 'inherit'
        }}>
          Ajouter une certification
        </DialogTitle>
        <DialogContent sx={{
          bgcolor: darkMode ? 'background.paper' : 'background.default',
          pt: 2
        }}>
          <Stack spacing={3}>
            <TextField
              label="Nom de la certification"
              name="name"
              value={newCertification.name}
              onChange={handleCertificationChange}
              fullWidth
              required
            />
            <TextField
              label="Organisme de certification"
              name="authority"
              value={newCertification.authority}
              onChange={handleCertificationChange}
              fullWidth
              required
            />
            <TextField
              label="Date de certification"
              name="date"
              type="date"
              value={newCertification.date}
              onChange={handleCertificationChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{
          bgcolor: darkMode ? 'background.paper' : 'background.default',
          px: 3,
          py: 2
        }}>
          <Button onClick={handleCloseCertificationModal} color="inherit">
            Annuler
          </Button>
          <Button 
            onClick={handleAddCertification} 
            variant="contained" 
            disabled={!newCertification.name || !newCertification.authority || !newCertification.date}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal d'analyse du CV */}
      <Dialog
        open={openCvAnalysis}
        onClose={handleCloseCvAnalysis}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkMode ? alpha('#fff', 0.08) : '#fff',
            backdropFilter: 'blur(12px)',
            borderRadius: 4,
            boxShadow: '0 8px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: darkMode ? '#fff' : '#1a1a1a',
          borderBottom: '1px solid',
          borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08),
          pb: 2
        }}>
          Analyse de votre CV
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {cvAnalysis ? (
            <Stack spacing={4}>
              {/* Score Global */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#fff' : '#1a1a1a' }}>
                  Score Global
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={cvAnalysis.scoreGlobal * 10}
                    size={120}
                    thickness={4}
                    sx={{
                      color: cvAnalysis.scoreGlobal >= 7 ? '#4caf50' : 
                             cvAnalysis.scoreGlobal >= 5 ? '#1976d2' : '#f44336'
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
                    <Typography variant="h4" component="div" sx={{ color: darkMode ? '#fff' : '#1a1a1a' }}>
                      {cvAnalysis.scoreGlobal}/10
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08) }} />

              {/* Points Forts */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#fff' : '#1a1a1a', display: 'flex', alignItems: 'center' }}>
                  <CheckCircleOutlineIcon sx={{ color: '#4caf50', mr: 1 }} />
                  Points Forts
                </Typography>
                <List>
                  {cvAnalysis.pointsForts?.map((point, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={point}
                        sx={{ color: darkMode ? '#e0e0e0' : '#4a4a4a' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Points à Améliorer */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#fff' : '#1a1a1a', display: 'flex', alignItems: 'center' }}>
                  <WarningAmberIcon sx={{ color: '#ff9800', mr: 1 }} />
                  Points à Améliorer
                </Typography>
                <List>
                  {cvAnalysis.pointsFaibles?.map((point, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={point}
                        sx={{ color: darkMode ? '#e0e0e0' : '#4a4a4a' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Recommandations */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#fff' : '#1a1a1a', display: 'flex', alignItems: 'center' }}>
                  <LightbulbOutlineIcon sx={{ color: '#1976d2', mr: 1 }} />
                  Recommandations
                </Typography>
                <List>
                  {cvAnalysis.recommandations?.map((reco, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={reco}
                        sx={{ color: darkMode ? '#e0e0e0' : '#4a4a4a' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Mots-clés */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#fff' : '#1a1a1a', display: 'flex', alignItems: 'center' }}>
                  <LocalOfferOutlinedIcon sx={{ mr: 1 }} />
                  Mots-clés Suggérés
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {cvAnalysis.motsClesSuggérés?.map((motCle, index) => (
                    <Chip
                      key={index}
                      label={motCle}
                      sx={{
                        bgcolor: darkMode ? alpha('#1976d2', 0.2) : alpha('#1976d2', 0.1),
                        color: darkMode ? '#90caf9' : '#1976d2',
                        '&:hover': {
                          bgcolor: darkMode ? alpha('#1976d2', 0.3) : alpha('#1976d2', 0.2)
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Offres Correspondantes */}
              {cvAnalysis.offresCorrespondantes && cvAnalysis.offresCorrespondantes.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#fff' : '#1a1a1a', display: 'flex', alignItems: 'center' }}>
                    <WorkIcon sx={{ mr: 1 }} />
                    Offres Correspondantes
                  </Typography>
                  <Stack spacing={2}>
                    {cvAnalysis.offresCorrespondantes.map((job, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: darkMode ? alpha('#fff', 0.08) : alpha('#000', 0.04),
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Stack spacing={1}>
                          <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#1a1a1a' }}>
                            {job.title}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ color: darkMode ? '#90caf9' : '#1976d2' }}>
                            {job.company}
                          </Typography>
                          <Stack direction="row" spacing={2}>
                            <Typography variant="body2" sx={{ color: darkMode ? '#e0e0e0' : '#4a4a4a' }}>
                              <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                              {job.location}
                            </Typography>
                            <Typography variant="body2" sx={{ color: darkMode ? '#e0e0e0' : '#4a4a4a' }}>
                              <WorkIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                              {job.experienceLevel}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: darkMode ? '#e0e0e0' : '#4a4a4a', mt: 1 }}>
                            {job.description}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: darkMode ? '#90caf9' : '#1976d2', mb: 0.5 }}>
                              Compétences requises:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {job.requiredSkills?.map((skill, idx) => (
                                <Chip
                                  key={idx}
                                  label={skill}
                                  size="small"
                                  sx={{
                                    bgcolor: darkMode ? alpha('#1976d2', 0.2) : alpha('#1976d2', 0.1),
                                    color: darkMode ? '#90caf9' : '#1976d2'
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          ) : (
            <Typography>Analyse en cours...</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid',
          borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08),
          p: 2
        }}>
          <Button onClick={handleCloseCvAnalysis} variant="outlined">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
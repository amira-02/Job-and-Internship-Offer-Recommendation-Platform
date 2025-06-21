import React, { useState, useEffect, useCallback } from 'react';
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
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import HourglassEmpty from "@mui/icons-material/HourglassEmpty";
import Cancel from "@mui/icons-material/Cancel";
import HelpOutline from "@mui/icons-material/HelpOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import InboxIcon from "@mui/icons-material/Inbox";
import CloseIcon from '@mui/icons-material/Close';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VisibilityIcon from '@mui/icons-material/Visibility';



import AssessmentIcon from '@mui/icons-material/Assessment';
import { motion, AnimatePresence } from 'framer-motion';



const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(['jwt']);
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

const fetchUserData = useCallback(async () => {
  if (!cookies.jwt) return null;

  try {
    const response = await axios.get('http://localhost:3000/api/auth/profile', {
      headers: { Authorization: `Bearer ${cookies.jwt}` },
      withCredentials: true
    });
 console.log("User data complet :", response.data);
    console.log("CV reçu depuis le backend :", response.data.user?.cv);
    console.log("Contenu du premier CV :", response.data.user?.cv?.[0]);
    const user = response.data;

    // Si l'utilisateur a des offres postulées
    if (Array.isArray(user.appliedOffers) && user.appliedOffers.length > 0) {
      // Récupérer les détails des offres une par une
      const detailedOffers = await Promise.all(
        user.appliedOffers.map(async (appliedOffer) => {
          try {
            const jobOfferResponse = await axios.get(`http://localhost:3000/api/joboffers/${appliedOffer._id}`, {
              headers: { Authorization: `Bearer ${cookies.jwt}` },
              withCredentials: true
            });
            return {
              ...jobOfferResponse.data,
              status: appliedOffer.status,
              offerId: appliedOffer._id
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération de l'offre ${appliedOffer._id}`, error);
            return null;
          }
        })
      );

      // Filtrer les offres nulles (échec de récupération)
      user.appliedOffers = detailedOffers.filter(Boolean);
    }

    return user;
  } catch (err) {
    console.error('Erreur lors de la récupération des données utilisateur (fetchUserData):', err);
    if (err.response?.status === 401) throw new Error('Unauthorized');
    throw err;  
  }
}, [cookies.jwt]);




  // Chargement des données utilisateur à l'initialisation
useEffect(() => {
  let isMounted = true;

  const loadProfile = async () => {
    setLoading(true);
    setError(null);

    if (!cookies.jwt) {
      if (isMounted) {
        setUserData(null);
        navigate('/login');
      }
      setLoading(false);
      return;
    }

    try {
      const data = await fetchUserData();

      if (isMounted) {
        // ✅ Fix: s'assurer que cv est toujours un tableau
        if (data.cv && !Array.isArray(data.cv)) {
          data.cv = [data.cv];
        }
        if (!data.cv) {
          data.cv = [];
        }

        setUserData(data);
      }
    } catch (err) {
      if (err.message === 'Unauthorized') {
        removeCookie('jwt');
        navigate('/login');
      } else {
        setError("Erreur lors du chargement du profil");
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  loadProfile();

  return () => {
    isMounted = false;
  };
}, [cookies.jwt, fetchUserData, navigate, removeCookie]);




  // Calcul du taux de complétion du profil
  useEffect(() => {
    if (userData) {
      const fields = [
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.governorate,
        // userData.mobileNumber,
        // userData.diplomaSpecialty,
        // userData.university,
        // userData.yearsOfExperience,
        // userData.employmentTypes?.length > 0,
        // userData.selectedDomains?.length > 0,
        userData.cv && userData.cv.length > 0
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

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', userData.cv.fileName || 'cv.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading CV:', err);
      setError('Erreur lors du téléchargement du CV');
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
  if (!file) return;

  // Vérification du type de fichier
  if (
    ![
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.type)
  ) {
    setError('Le fichier doit être au format PDF ou Word');
    return;
  }

  // Vérification de la taille
  if (file.size > 5 * 1024 * 1024) {
    setError('Le fichier ne doit pas dépasser 5MB');
    return;
  }

  const formData = new FormData();
  formData.append('cv', file);

  try {
    setLoading(true);
    setError(null);

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
    console.log("Contenu du premier CV :", response.data.cv?.[0]);
console.log("CV reçu depuis le backend :", response.data.cv);

    if (response.data.status) {
      // ✅ Forcer cv à être un tableau
      setUserData(prev => ({
        ...prev,
        cv: Array.isArray(response.data.cv)
          ? response.data.cv
          : response.data.cv
          ? [response.data.cv]
          : []
      }));

      await fetchUserData();
      setError(null);
    } else {
      throw new Error(response.data.message || 'Erreur lors de l\'upload du CV');
    }
  } catch (err) {
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





const handleOpenCvAnalysis = async (cvIndex = 0) => {
  try {
    if (!userData?.cv || !Array.isArray(userData.cv) || userData.cv.length === 0) {
      setError("Aucun CV n'a été téléchargé.");
      return;
    }
    if (cvIndex < 0 || cvIndex >= userData.cv.length) {
      setError(`CV introuvable à l'index ${cvIndex}.`);
      return;
    }

    setLoading(true);

    const cvMeta = userData.cv[cvIndex];
    if (!cvMeta.fileName && !cvMeta.originalname && !cvMeta.name) {
      setError(`Le CV à l'index ${cvIndex} ne contient pas de nom de fichier valide.`);
      return;
    }

    // Récupérer le fichier CV depuis le backend
    const fileName = cvMeta.fileName || cvMeta.originalname || cvMeta.name;
    const cvResponse = await axios.get(
      `http://localhost:3000/api/auth/cv/${userData._id}?fileName=${encodeURIComponent(fileName)}`,
      {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${cookies.jwt}` },
        withCredentials: true,
      }
    );

    const cvFile = new File([cvResponse.data], fileName, {
      type: cvResponse.headers['content-type'] || 'application/pdf',
    });

    const formData = new FormData();
    formData.append('file', cvFile);

    // Envoyer pour analyse
    const response = await axios.post('http://localhost:3000/api/analyze-cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log("🧠 Réponse analyse CV complète :", response.data);

    // if (response.data && response.data.analysis) {
    //   setCvAnalysis(response.data.analysis);
    //   setOpenCvAnalysis(true);
    // } 
    if (response.data.analysis) {
  const blobUrl = URL.createObjectURL(cvFile);
 navigate('/cv-analysis', {
  state: {
    cvBufferBase64: response.data.cvBufferBase64,
    analysis: response.data.analysis,
    topOffers: response.data.topOffers,
  },
});

}else {
      setError("Erreur lors de l'analyse du CV : réponse inattendue.");
    }

  } catch (err) {
    console.error('Erreur lors de l\'analyse du CV:', err);
    setError(err.response?.data?.detail || err.message || "Erreur lors de l'analyse du CV");
  } finally {
    setLoading(false);
  }
};



  const handleCloseCvAnalysis = () => {
    setOpenCvAnalysis(false);
    setCvAnalysis(null);
  };


// const handleUpload = async () => {
//   const formData = new FormData();
//   formData.append("cv", selectedFile); // ou file selon ta variable

//   try {
//     setIsLoading(true); // pour affichage loader

//     const response = await axios.post("http://localhost:3000/api/analyze-cv", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     console.log("✅ Réponse du backend :", response.data);
//     setAnalysisResult(response.data.analysis); // → très important
//   } catch (error) {
//     console.error("❌ Erreur lors de l'analyse du CV :", error);
//     alert("Erreur lors de l'analyse du CV !");
//   } finally {
//     setIsLoading(false);
//   }
// };



 const [offers, setOffers] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchAppliedOffers = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/joboffers/user/applied", {
          withCredentials: true,
        });
        setOffers(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des offres :", err);
      }
    };

    fetchAppliedOffers();
  }, []);

  const getStatusIcon = (status, isActive) => {
    const size = isActive ? "medium" : "small";
    if (status === "accepted") return <CheckCircleOutline fontSize={size} />;
    if (status === "pending") return <HourglassEmpty fontSize={size} />;
    if (status === "rejected") return <Cancel fontSize={size} />;
    return <HelpOutline fontSize={size} />;
  };

  const filteredOffers = filter === "all"
    ? offers
    : offers.filter((offer) => offer.status.toLowerCase() === filter.toLowerCase());







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

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Utilisateur non trouvé</Typography>
      </Box>
    );
  }
// console.log("CV reçu depuis le backend :", userData.cv);



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
                {/* <Paper
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
                </Paper> */}

             {/* CV Section */}
  <Paper
  elevation={0}
  sx={{
    p: 3,
    borderRadius: 4,
    bgcolor: darkMode ? alpha('#fff', 0.08) : '#fff',
    border: '1px solid',
    borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.08),
    transition: 'all 0.3s ease',
  }}
>
  <Stack spacing={2}>
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
      <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? '#fff' : '#1a1a1a' }}>
        CVs
      </Typography>

      {Array.isArray(userData?.cv) && userData.cv.length > 0 && (
        <IconButton
          onClick={handleCvMenuOpen}
          sx={{
            color: darkMode ? alpha('#fff', 0.7) : alpha('#000', 0.5),
            '&:hover': { color: '#1976d2' },
          }}
        >
          <MoreVertIcon />
        </IconButton>
      )}
    </Stack>

    {Array.isArray(userData?.cv) && userData.cv.length > 0 ? (
      <Stack spacing={1}>
        {userData.cv.map((cvFile, idx) => (
          <Stack key={idx} direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">
              {cvFile?.originalname || cvFile?.fileName || cvFile?.name || `CV n°${idx + 1}`}
            </Typography>

            <IconButton
              onClick={() =>
                window.open(`http://localhost:3000/api/auth/cv/${userData._id}/${idx}`, '_blank')
              }
              sx={{
                color: '#1976d2',
                bgcolor: alpha('#1976d2', 0.1),
                '&:hover': { bgcolor: alpha('#1976d2', 0.2) },
              }}
            >
              <DownloadIcon />
            </IconButton>

            <IconButton
              onClick={async () => {
                if (window.confirm('Supprimer ce CV ?')) {
                  setLoading(true);
                  try {
                    await axios.delete(`http://localhost:3000/api/auth/cv/${userData._id}/${idx}`, {
                      headers: { Authorization: `Bearer ${cookies.jwt}` },
                      withCredentials: true,
                    });
                    const updatedData = await fetchUserData();
                    setUserData({
                      ...updatedData,
                      cv: Array.isArray(updatedData.cv)
                        ? updatedData.cv
                        : updatedData.cv
                        ? [updatedData.cv]
                        : [],
                    });
                  } catch (err) {
                    console.error(err);
                    setError('Erreur lors de la suppression du CV');
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              sx={{
                color: '#d32f2f',
                bgcolor: alpha('#d32f2f', 0.1),
                '&:hover': { bgcolor: alpha('#d32f2f', 0.2) },
              }}
            >
              <DeleteIcon />
            </IconButton>

            <Tooltip title="Voir l'analyse du CV">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <IconButton
                  onClick={() => handleOpenCvAnalysis(idx)} // <-- Passer l'index dynamique ici
                  sx={{
                    color: '#1976d2',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2) },
                  }}
                  aria-label="analyse du cv"
                >
                  <AssessmentIcon />
                </IconButton>
              </motion.div>
            </Tooltip>
          </Stack>
        ))}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => cvFileInputRef.current?.click()}
          sx={{
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': {
              borderColor: '#1976d2',
              bgcolor: alpha('#1976d2', 0.1),
            },
          }}
        >
          Ajouter un CV
        </Button>
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
              bgcolor: alpha('#1976d2', 0.1),
            },
          }}
        >
          Ajouter un CV
        </Button>
        <Typography
          variant="caption"
          sx={{ color: darkMode ? alpha('#fff', 0.7) : alpha('#000', 0.6) }}
        >
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
      <a href="https://www.linkedin.com/in/ton-profil" target="_blank" rel="noopener noreferrer">
        <IconButton sx={{ color: '#0a66c2', '&:hover': { bgcolor: alpha('#0a66c2', 0.1) } }}>
          <LinkedInIcon />
        </IconButton>
      </a>
    </Tooltip>
    <Tooltip title="GitHub">
      <a href="https://github.com" target="_blank" rel="noopener noreferrer">
        <IconButton sx={{ color: '#181717', '&:hover': { bgcolor: alpha('#181717', 0.1) } }}>
          <GitHubIcon />
        </IconButton>
      </a>
    </Tooltip>
    <Tooltip title="Instagram">
      <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
        <IconButton sx={{ color: '#E4405F', '&:hover': { bgcolor: alpha('#E4405F', 0.1) } }}>
          <InstagramIcon />
        </IconButton>
      </a>
    </Tooltip>
    <Tooltip title="Twitter">
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
        <IconButton sx={{ color: '#1DA1F2', '&:hover': { bgcolor: alpha('#1DA1F2', 0.1) } }}>
          <TwitterIcon />
        </IconButton>
      </a>
    </Tooltip>
  </Stack>
</Paper>



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
             
<Paper 
  elevation={4} 
  sx={{ 
    padding: 4,
    marginTop: 4,
    borderRadius: 4,
    background: 'linear-gradient(135deg, #ffffff, #f0f4f8)'
  }}
>
  <Typography 
    variant="h4" 
    gutterBottom 
    sx={{ 
      fontWeight: 700,
      color: '#1a2b3c',
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      letterSpacing: '0.5px'
    }}
  >
    <DescriptionIcon fontSize="large" sx={{ color: '#3b82f6' }} />
    Mes Candidatures
  </Typography>

  <Box sx={{ 
    display: 'flex', 
    gap: 1.5, 
    mb: 4,
    flexWrap: 'wrap',
    '& .MuiButton-root': {
      borderRadius: 30,
      textTransform: 'none',
      fontWeight: 600,
      px: 3,
      py: 1.2,
      transition: 'all 0.2s ease',
      boxShadow: '0 3px 6px rgba(0,0,0,0.12)'
    }
  }}>
    {["all", "accepted", "pending", "rejected"].map((status) => (
      <Button
        key={status}
        variant={filter === status ? "contained" : "outlined"}
        color={
          status === "accepted"
            ? "success"
            : status === "pending"
            ? "warning"
            : status === "rejected"
            ? "error"
            : "primary"
        }
        onClick={() => setFilter(status)}
        startIcon={getStatusIcon(status, filter === status)}
        sx={{
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            transform: 'translateY(-3px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        }}
      >
        {status === "all" 
          ? "Toutes les candidatures" 
          : status.charAt(0).toUpperCase() + status.slice(1)}
      </Button>
    ))}
  </Box>

  {filteredOffers.length > 0 ? (
    <List sx={{ py: 0 }}>
      {filteredOffers.map((offer) => {
        const statusColor = offer.status === 'accepted' ? '#22c55e' : 
                            offer.status === 'pending' ? '#f59e0b' : 
                            offer.status === 'rejected' ? '#ef4444' : '#6b7280';

        return (
          <Paper
            key={offer._id}
            elevation={3}
            sx={{
              mb: 2.5,
              p: 3.5,
              borderRadius: 4,
              borderLeft: `8px solid ${statusColor}`,
              backgroundColor: '#ffffff',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                backgroundColor: '#f8fafc'
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" gap={2.5} alignItems="center">
                <WorkIcon sx={{ color: '#2563eb', fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                    {offer.title}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1.2}>
                    <BusinessIcon fontSize="small" sx={{ color: '#4b5563' }} />
                    <Typography variant="body2" color="text.secondary">
                      {offer.company || "Entreprise non spécifiée"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Chip
                label={offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                size="medium"
                sx={{
                  fontWeight: 600,
                  backgroundColor: `${statusColor}15`,
                  color: statusColor,
                  border: `1px solid ${statusColor}40`,
                  borderRadius: 2
                }}
              />
            </Box>

            <Box display="flex" justifyContent="flex-end" mt={2.5}>
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                size="medium"
                onClick={() => navigate(`/offers/${offer._id}`)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 30,
                  px: 2.5,
                  py: 0.8,
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  '&:hover': {
                    backgroundColor: '#3b82f605',
                    borderColor: '#2563eb'
                  }
                }}
              >
                Voir l’offre
              </Button>
            </Box>
          </Paper>
        );
      })}
    </List>
  ) : (
    <Box sx={{ 
      textAlign: 'center', 
      py: 8,
      border: '2px dashed #d1d5db',
      borderRadius: 3,
      backgroundColor: '#f9fafb'
    }}>
      <InboxIcon sx={{ fontSize: 56, color: '#9ca3af', mb: 1.5 }} />
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
        Aucune candidature trouvée pour ce statut
      </Typography>
      <Button 
        variant="text" 
        color="primary" 
        sx={{ mt: 2, fontWeight: 600, textTransform: 'none' }}
        onClick={() => setFilter('all')}
      >
        Voir toutes les candidatures
      </Button>
    </Box>
  )}
</Paper>

 

                {/* Education */}
                {/* <Paper
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
                        <IconButton 
                          sx={{ 
                            color: '#1976d2',
                            bgcolor: alpha('#1976d2', 0.1),
                            '&:hover': { bgcolor: alpha('#1976d2', 0.2) }
                          }}
                        >
                          <AddIcon />
                        </IconButton>
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
                </Paper> */}

                {/* TODO: Add Types d'emploi recherchés / Domaines d'intérêt (as per image, maybe small cards) */}

           
                
                 {/* Section Langues */}
                  {/* <Paper
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
                  </Paper> */}

                 {/* Section Certifications */}
                  {/* <Paper
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
                  </Paper> */}

               
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
     {openCvAnalysis && (
  <Dialog open={openCvAnalysis} onClose={() => setOpenCvAnalysis(false)}>
    <DialogTitle>Analyse de votre CV</DialogTitle>
    <DialogContent>
      <Typography component="pre" style={{ whiteSpace: 'pre-wrap' }}>
        {cvAnalysis || "Analyse vide"}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpenCvAnalysis(false)}>Fermer</Button>
    </DialogActions>
  </Dialog>
)}


    </Box>
  );
};

export default ProfilePage;
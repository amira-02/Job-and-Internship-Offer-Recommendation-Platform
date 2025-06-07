// import React, { useState, useEffect } from 'react';
// import { 
//   Container, 
//   Paper, 
//   Typography, 
//   Grid, 
//   Box, 
//   Button, 
//   Divider,
//   CircularProgress
// } from '@mui/material';
// import { useCookies } from 'react-cookie';
// import axios from 'axios';
// import Header from '../components/Header';
// import DownloadIcon from '@mui/icons-material/Download';

// const Profile = () => {
//   const [cookies] = useCookies(['jwt']);
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const response = await axios.get('http://localhost:3000/api/auth/profile', {
//           headers: {
//             Authorization: `Bearer ${cookies.jwt}`
//           }
//         });
//         setUserData(response.data);
//       } catch (err) {
//         console.error('Error fetching user data:', err);
//         setError('Erreur lors du chargement du profil');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [cookies.jwt]);

//   const handleDownloadCV = async () => {
//     try {
//       const response = await axios.get(`http://localhost:3000/api/auth/cv/${userData._id}`, {
//         responseType: 'blob',
//         headers: {
//           Authorization: `Bearer ${cookies.jwt}`
//         }
//       });

//       // Créer un lien de téléchargement
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', userData.cv.fileName || 'cv.pdf');
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (err) {
//       console.error('Error downloading CV:', err);
//       setError('Erreur lors du téléchargement du CV');
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
//         <Typography color="error">{error}</Typography>
//       </Box>
//     );
//   }

//   if (!userData) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
//         <Typography>Utilisateur non trouvé</Typography>
//       </Box>
//     );
//   }

//   return (
//     <div>
//       <Header />
//       <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
//         <Paper elevation={3} sx={{ p: 4 }}>
//           <Typography variant="h4" gutterBottom>
//             Profil Utilisateur
//           </Typography>
//           <Divider sx={{ mb: 3 }} />

//           <Grid container spacing={3}>
//             {/* Informations Personnelles */}
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Informations Personnelles
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="subtitle2" color="text.secondary">Nom</Typography>
//                   <Typography>{userData.firstName} {userData.lastName}</Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="subtitle2" color="text.secondary">Email</Typography>
//                   <Typography>{userData.email}</Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="subtitle2" color="text.secondary">Gouvernorat</Typography>
//                   <Typography>{userData.governorate}</Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="subtitle2" color="text.secondary">Téléphone</Typography>
//                   <Typography>{userData.mobileNumber}</Typography>
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* Formation */}
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
//                 Formation
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="subtitle2" color="text.secondary">Diplôme/Spécialité</Typography>
//                   <Typography>{userData.diplomaSpecialty}</Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="subtitle2" color="text.secondary">Université</Typography>
//                   <Typography>{userData.university}</Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="subtitle2" color="text.secondary">Date de début</Typography>
//                   <Typography>{new Date(userData.studyStartDate).toLocaleDateString()}</Typography>
//                 </Grid>
//                 {!userData.isCurrentlyStudying && (
//                   <Grid item xs={12} sm={6}>
//                     <Typography variant="subtitle2" color="text.secondary">Date de fin</Typography>
//                     <Typography>{new Date(userData.studyEndDate).toLocaleDateString()}</Typography>
//                   </Grid>
//                 )}
//                 <Grid item xs={12}>
//                   <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
//                   <Typography>{userData.isCurrentlyStudying ? 'Étudiant actuel' : 'Diplômé'}</Typography>
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* Expérience */}
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
//                 Expérience
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="subtitle2" color="text.secondary">Années d'expérience</Typography>
//                   <Typography>{userData.yearsOfExperience} ans</Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="subtitle2" color="text.secondary">Type d'emploi recherché</Typography>
//                   <Typography>{userData.employmentTypes?.join(', ')}</Typography>
//                 </Grid>
//                 <Grid item xs={12}>
//                   <Typography variant="subtitle2" color="text.secondary">Domaine(s)</Typography>
//                   <Typography>{userData.selectedDomains?.join(', ')}</Typography>
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* CV */}
//             {userData.cv && (
//               <Grid item xs={12}>
//                 <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
//                   <Typography variant="h6">CV</Typography>
//                   <Button
//                     variant="outlined"
//                     startIcon={<DownloadIcon />}
//                     onClick={handleDownloadCV}
//                     sx={{
//                       borderColor: 'black',
//                       color: 'black',
//                       '&:hover': {
//                         borderColor: 'black',
//                         backgroundColor: 'rgba(0, 0, 0, 0.04)',
//                       },
//                     }}
//                   >
//                     Télécharger CV
//                   </Button>
//                 </Box>
//               </Grid>
//             )}
//           </Grid>
//         </Paper>
//       </Container>
//     </div>
//   );
// };

// export default Profile; 
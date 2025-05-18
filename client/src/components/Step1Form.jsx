import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
} from '@mui/material';
import '../styles/Auth.css'; // Importer les styles d'authentification

// Liste des gouvernorats de Tunisie (simplifiée, peut être complétée)
const tunisianGovernorates = [
  'Ariana',
  'Ben Arous',
  'Bizerte',
  'Gabès',
  'Gafsa',
  'Jendouba',
  'Kairouan',
  'Kasserine',
  'Kebili',
  'Le Kef',
  'Mahdia',
  'La Manouba',
  'Medenine',
  'Monastir',
  'Nabeul',
  'Sfax',
  'Sidi Bouzid',
  'Siliana',
  'Sousse',
  'Tataouine',
  'Tozeur',
  'Tunis',
];

const Step1Form = ({ formData, onFormChange }) => {
  // Gérer l'état local du formulaire pour cette étape
  const [stepData, setStepData] = useState({
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    email: formData.email || '',
    password: formData.password || '',
    confirmPassword: formData.confirmPassword || '',
    governorate: formData.governorate || '',
  });

  // Mettre à jour l'état global dans le composant parent chaque fois que stepData change
  useEffect(() => {
    onFormChange(stepData);
  }, [stepData, onFormChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStepData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>Informations Générales</Typography>
      <TextField
        label="Nom"
        name="lastName"
        value={stepData.lastName}
        onChange={handleChange}
        fullWidth
        required
        InputProps={{
          className: 'form-input'
        }}
        InputLabelProps={{
          className: 'form-label'
        }}
      />
      <TextField
        label="Prénom"
        name="firstName"
        value={stepData.firstName}
        onChange={handleChange}
        fullWidth
        required
        InputProps={{
          className: 'form-input'
        }}
        InputLabelProps={{
          className: 'form-label'
        }}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={stepData.email}
        onChange={handleChange}
        fullWidth
        required
        InputProps={{
          className: 'form-input'
        }}
        InputLabelProps={{
          className: 'form-label'
        }}
      />
      <TextField
        label="Mot de passe"
        name="password"
        type="password"
        value={stepData.password}
        onChange={handleChange}
        fullWidth
        required
        InputProps={{
          className: 'form-input'
        }}
        InputLabelProps={{
          className: 'form-label'
        }}
      />
      <TextField
        label="Confirmer le mot de passe"
        name="confirmPassword"
        type="password"
        value={stepData.confirmPassword}
        onChange={handleChange}
        fullWidth
        required
        InputProps={{
          className: 'form-input'
        }}
        InputLabelProps={{
          className: 'form-label'
        }}
      />
      <FormControl fullWidth required>
        <InputLabel id="governorate-label">Gouvernorat</InputLabel>
        <Select
          labelId="governorate-label"
          id="governorate-select"
          name="governorate"
          value={stepData.governorate}
          label="Gouvernorat"
          onChange={handleChange}
          InputProps={{
            className: 'form-input'
          }}
          InputLabelProps={{
            className: 'form-label'
          }}
        >
          {tunisianGovernorates.map((gov) => (
            <MenuItem key={gov} value={gov}>
              {gov}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* Les boutons Précédent/Suivant sont dans le parent RegistrationWorkflow */}
    </Box>
  );
};

export default Step1Form; 
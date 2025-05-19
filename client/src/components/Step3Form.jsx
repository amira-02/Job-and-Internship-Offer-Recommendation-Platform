import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import '../styles/Auth.css'; // Importer les styles d'authentification

// Liste des gouvernorats de Tunisie (répétée pour l'autonomie du composant, peut être importée centralement si besoin)
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

const Step3Form = ({ formData, onFormChange }) => {
  const [stepData, setStepData] = useState({
    country: formData.country || 'Tunisie', // Par défaut sur Tunisie
    governorate: formData.governorate || '',
    city: formData.city || '',
    zipCode: formData.zipCode || '',
    address: formData.address || '',
    mobileNumber: formData.mobileNumber || '',
    otherPhone: formData.otherPhone || '', // Optionnel
  });

  // Pré-remplir le gouvernorat si déjà sélectionné à l'étape 1
  useEffect(() => {
    if (formData.governorate && !stepData.governorate) {
      setStepData(prevData => ({ ...prevData, governorate: formData.governorate }));
    }
  }, [formData.governorate, stepData.governorate]);

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
      <Typography variant="h6" gutterBottom>Informations de Contact et Localisation</Typography>

      <FormControl fullWidth required>
        <InputLabel id="country-label">Pays</InputLabel>
        <Select
          labelId="country-label"
          id="country-select"
          name="country"
          value={stepData.country}
          label="Pays"
          onChange={handleChange}
          disabled // Pays est fixe sur Tunisie pour l'instant
        >
          <MenuItem value="Tunisie">Tunisie</MenuItem>
        </Select>
      </FormControl>

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

       <TextField
        label="Ville"
        name="city"
        value={stepData.city}
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
        label="Code postal"
        name="zipCode"
        value={stepData.zipCode}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        label="Adresse"
        name="address"
        value={stepData.address}
        onChange={handleChange}
        fullWidth
        InputProps={{
          className: 'form-input'
        }}
        InputLabelProps={{
          className: 'form-label'
        }}
      />

      <Divider sx={{ my: 2 }} /> {/* Séparateur */}

      <Typography variant="h6" gutterBottom>Informations de Contact</Typography>

      <TextField
        label="Numéro de portable"
        name="mobileNumber"
        value={stepData.mobileNumber}
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

     

    </Box>
  );
};

export default Step3Form; 
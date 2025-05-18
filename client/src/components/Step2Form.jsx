import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Checkbox,
  FormGroup,
  TextField,
  OutlinedInput,
  InputLabel,
  MenuItem,
  Select,
  Chip,
}
from '@mui/material';
import '../styles/Auth.css';

const experienceLevels = [
  'Étudiant',
  'Débutant',
  'Avec Expérience (Non-Manager)',
  'Responsable (Manager)',
  'Je suis au chômage et je cherche un travail',
];

const employmentTypes = [
  'CDD', 'CDI', 'Temps partiel', 'Temps plein', 'Freelancer', 'Saisonnier'
];

const activityDomains = [
  'Achat - Approvisionnement', 'Administration', 'Agriculture', 'Agroalimentaire',
  'Aide Humanitaire et Protection Civile', 'Architecture d\'intérieur', 'Automobile', 'Automatisme',
  'Assurances', 'Archive', 'Banque', 'Biotechnologie', 'Centres d\'appels', 'Chimie',
  'Commerce', 'Comptabilité', 'Controle Qualite', 'Construction', 'Constrution métallique', 'Consulting',
  'Commerce de détail', 'Design', 'Developpement des affaires', 'Distribution', 'Documentation', 'Domotique',
  'Education Physique', 'Electricité', 'Electronique', 'Environnement', 'Enseignement', 'Esthétique',
  'Fonction publique', 'Formation', 'Finance', 'Gestion', 'Hôtellerie et Tourisme', 'Industrie',
  'Informatique', 'Ingenierie', 'Immobilier', 'Installation-Entretien-Reparation', 'Juridique', 'Maison',
  'Marketing', 'Mécanique', 'Mécatronique', 'Media-Journalisme', 'Télécommunications', 'Transport',
  'Vente', 'Stratégie-Planification', 'Science', 'Pharmaceutiques', 'Recherche', 'Restauration',
  'Ressources humaines', 'Sante', 'Services veterinaires', 'Services a la clientele', 'Stage', 'Pétrolière',
  'Technologie de l\'information', 'Transport', 'Textile', 'Sport et Fitness', 'Supply chain', 'Audit Interne',
  'Digital Marketing', 'Sécurité',
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Step2Form = ({ formData, onFormChange }) => {
  const [stepData, setStepData] = useState({
    experienceLevel: formData.experienceLevel || '',
    employmentTypes: formData.employmentTypes || [],
    desiredJobTitle: formData.desiredJobTitle || '',
    selectedDomains: formData.selectedDomains || [],
  });

  useEffect(() => {
    onFormChange(stepData);
  }, [stepData, onFormChange]);

  const handleExperienceChange = (event) => {
    setStepData(prevData => ({
      ...prevData,
      experienceLevel: event.target.value,
    }));
  };

  const handleEmploymentTypeChange = (event) => {
    const { value, checked } = event.target;
    setStepData(prevData => ({
      ...prevData,
      employmentTypes: checked
        ? [...prevData.employmentTypes, value]
        : prevData.employmentTypes.filter((type) => type !== value),
    }));
  };

  const handleDesiredJobTitleChange = (event) => {
    setStepData(prevData => ({
      ...prevData,
      desiredJobTitle: event.target.value,
    }));
  };

  const handleDomainChange = (event) => {
    const { value } = event.target;
    setStepData(prevData => ({
      ...prevData,
      selectedDomains: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" gutterBottom>Intérêts Professionnels</Typography>

      <FormControl component="fieldset" required>
        <FormLabel component="legend">Quel est votre niveau d'experience Professionnel?</FormLabel>
        <RadioGroup
          name="experienceLevel"
          value={stepData.experienceLevel}
          onChange={handleExperienceChange}
        >
          {experienceLevels.map((level) => (
            <FormControlLabel key={level} value={level} control={<Radio />} label={level} />
          ))}
        </RadioGroup>
      </FormControl>

      <FormControl component="fieldset" required>
        <FormLabel component="legend">À quel (s) type (s) d'emploi êtes-vous ouvert (e)?</FormLabel>
        <FormGroup>
          {employmentTypes.map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  checked={stepData.employmentTypes.includes(type)}
                  onChange={handleEmploymentTypeChange}
                  value={type}
                />
              }
              label={type}
            />
          ))}
        </FormGroup>
      </FormControl>

      <TextField
        label="Nom de poste / fonction recherché(e)"
        name="desiredJobTitle"
        value={stepData.desiredJobTitle}
        onChange={handleDesiredJobTitleChange}
        fullWidth
        required
        InputProps={{
          className: 'form-input'
        }}
        InputLabelProps={{
          className: 'form-label'
        }}
      />

      <FormControl fullWidth>
        <InputLabel id="activity-domains-label">Domaines d'activités intéressés</InputLabel>
        <Select
          labelId="activity-domains-label"
          id="activity-domains-select"
          multiple
          name="selectedDomains"
          value={stepData.selectedDomains}
          onChange={handleDomainChange}
          input={<OutlinedInput id="select-multiple-chip" label="Domaines d'activités intéressés" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {activityDomains.map((domain) => (
            <MenuItem key={domain} value={domain}>
              {domain}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default Step2Form; 
import React, { useState } from 'react';
import { Typography, TextField, Grid, FormControlLabel, Checkbox, RadioGroup, Radio, FormControl, FormLabel, Button, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Step4Form = ({ formData, onFormChange }) => {
  const [cvFileName, setCvFileName] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFormChange({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    onFormChange({
      ...formData,
      [name]: checked,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        alert('Please upload a PDF or Word document');
        return;
      }
      // Check file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      setCvFileName(file.name);
      onFormChange({
        ...formData,
        cv: file
      });
    }
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Experience and Education Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Years of Experience</FormLabel>
            <RadioGroup
              row
              name="yearsOfExperience"
              value={formData.yearsOfExperience || '0'}
              onChange={handleInputChange}
            >
              <FormControlLabel value="0" control={<Radio />} label="0-1 years" />
              <FormControlLabel value="1" control={<Radio />} label="1-3 years" />
              <FormControlLabel value="3" control={<Radio />} label="3-5 years" />
              <FormControlLabel value="5" control={<Radio />} label="5+ years" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="diplomaSpecialty"
            name="diplomaSpecialty"
            label="Diploma/Specialty"
            fullWidth
            variant="standard"
            value={formData.diplomaSpecialty || ''}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="university"
            name="university"
            label="University"
            fullWidth
            variant="standard"
            value={formData.university || ''}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="studyStartDate"
            name="studyStartDate"
            label="Study Start Date"
            fullWidth
            variant="standard"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            value={formData.studyStartDate || ''}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="studyEndDate"
            name="studyEndDate"
            label="Study End Date"
            fullWidth
            variant="standard"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            value={formData.studyEndDate || ''}
            onChange={handleInputChange}
            disabled={formData.isCurrentlyStudying}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                name="isCurrentlyStudying"
                checked={formData.isCurrentlyStudying || false}
                onChange={handleCheckboxChange}
              />
            }
            label="Currently Studying"
          />
        </Grid>

        {/* CV Upload Field */}
        <Grid item xs={12}>
          <Box sx={{ mt: 2 }}>
            <input
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              id="cv-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="cv-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{
                  borderColor: 'black',
                  color: 'black',
                  '&:hover': {
                    borderColor: 'black',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                Upload CV
              </Button>
            </label>
            {cvFileName && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {cvFileName}
              </Typography>
            )}
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              Accepted formats: PDF, DOC, DOCX (max 5MB)
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Step4Form; 
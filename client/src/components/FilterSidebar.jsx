import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  TextField,
  InputAdornment,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

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

const FilterSidebar = ({ offers, onFilterChange }) => {
  const [open, setOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const cities = [...new Set(offers.map(offer => offer.location).filter(Boolean))].sort();
  const domains = [...new Set(offers.map(offer => {
    if (offer.domain) return offer.domain.toLowerCase();
    const title = offer.title.toLowerCase();
    const description = offer.description.toLowerCase();
    const commonDomains = [
      'développement', 'développeur', 'programmation', 'informatique',
      'web', 'mobile', 'frontend', 'backend', 'fullstack', 'data',
      'marketing', 'commercial', 'finance', 'rh', 'design', 'gestion'
    ];
    return commonDomains.find(domain => title.includes(domain) || description.includes(domain)) || 'autre';
  }))].sort();

  useEffect(() => {
    const filteredOffers = offers.filter(offer => {
      const matchesSearch = !searchTerm || 
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCity = selectedCities.length === 0 || 
        (offer.location && selectedCities.includes(offer.location));

      const matchesDomain = selectedDomains.length === 0 || 
        selectedDomains.some(domain => {
          const offerDomain = offer.domain?.toLowerCase() || 
            domains.find(d => 
              offer.title.toLowerCase().includes(d) ||
              offer.description.toLowerCase().includes(d)
            ) || 'autre';
          return offerDomain === domain;
        });

      return matchesSearch && matchesCity && matchesDomain;
    });

    onFilterChange(filteredOffers);
  }, [searchTerm, selectedCities, selectedDomains, offers, onFilterChange]);

  const handleCityChange = (event) => {
    setSelectedCities(typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value);
  };

  const handleDomainChange = (event) => {
    setSelectedDomains(typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value);
  };

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 2,
        backgroundColor: 'white',
        overflow: 'auto',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {isMobile && (
        <Box sx={{ 
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'left',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: theme.palette.primary.main,
          color: 'white',
        }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon /> Filtres
          </Typography>
          <IconButton onClick={toggleSidebar} sx={{ color: 'white' }}>
            {open ? <CloseIcon /> : <FilterListIcon />}
          </IconButton>
        </Box>
      )}

      <Collapse in={open || !isMobile} timeout="auto" unmountOnExit={isMobile}>
        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 3, md: 2 },
          flex: 1,
          alignItems: 'center'
        }}>
          <TextField
            variant="outlined"
            placeholder="Rechercher un emploi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />

          <FormControl 
            sx={{ minWidth: 120, flex: '0 0 auto' }}
          >
            <InputLabel>Ville</InputLabel>
            <Select
              multiple
              value={selectedCities}
              onChange={handleCityChange}
              input={<OutlinedInput label="Ville" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} sx={{ backgroundColor: '#e0e0e0' }} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {cities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl 
            sx={{ minWidth: 120, flex: '0 0 auto' }}
          >
            <InputLabel>Domaine</InputLabel>
            <Select
              multiple
              value={selectedDomains}
              onChange={handleDomainChange}
              input={<OutlinedInput label="Domaine" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={value.charAt(0).toUpperCase() + value.slice(1)}
                      sx={{ backgroundColor: '#bbdefb' }}
                    />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {domains.map((domain) => (
                <MenuItem key={domain} value={domain}>
                  {domain.charAt(0).toUpperCase() + domain.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default FilterSidebar;
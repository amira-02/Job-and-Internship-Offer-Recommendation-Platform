import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import '../styles/JobLocationSection.css';
import '../styles/JobOffers.css';
import { Typography, Box, FormControl, InputLabel, Select, MenuItem, Paper, Divider, Checkbox, Slider, Button, TextField, IconButton, Chip, useMediaQuery } from '@mui/material';
import bgImage from '../assets/images/bg2.png';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useTheme } from '@mui/material/styles';

const jobTypes = [
  'Fulltime',
  'Part time',
  'Fixed-Price',
  'Freelance',
];
const experienceTypes = [
  'Fresher',
  'Intermediate',
  'No-Experience',
  'Internship',
  'Expert',
];

const truncate = (str, n) => (str && str.length > n ? str.slice(0, n) + '...' : str);

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const offersPerPage = 12;
  const [searchTerm, setSearchTerm] = useState('');
  // Filtres
  const [filters, setFilters] = useState({
    location: '',
    type: [],
    experience: [],
    salary: [0, 3500],
  });
  const [salaryRange, setSalaryRange] = useState([0, 3500]);
  // Pour l'animation du modal
  const [modalVisible, setModalVisible] = useState(false);
  // Tri
  const [sort, setSort] = useState('');

  // Responsive
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Card interaction state
  const [activeCardId, setActiveCardId] = useState(null);

  // Etat d'expansion pour chaque section
  const [expanded, setExpanded] = useState({
    location: true,
    jobType: true,
    experience: true,
    salary: true,
    category: true,
    tags: true,
  });
  const toggleSection = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Show more/less pour Category et Tags
  const [showAllCategory, setShowAllCategory] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  // Catégories et tags fictifs pour l'exemple
  const categories = [
    'Developer', 'Coder', 'Finance', 'Accounting', 'Design', 'Artist', 'Application', 'Marketing', 'Business', 'Web', 'Data', 'Scientist', 'Designer', 'UX/UI', 'Manager', 'Engineer', 'Writer', 'Content', 'Graphic', 'Management', 'Product'
  ];
  const tags = [
    'java', 'developer', 'finance', 'accounting', 'design', 'seo', 'javascript', 'designer', 'web', 'frontend', 'data', 'analytics', 'ui', 'ux', 'marketing', 'management', 'software', 'engineering', 'writing', 'blogging', 'graphic', 'illustration', 'product'
  ];
  // Compteur fictif pour chaque catégorie (à adapter selon tes données)
  const countByCategory = (cat) => 2 + Math.floor(Math.random() * 5);

  // Filtrage Category et Tags
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const handleCategoryChange = (cat) => {
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    setCurrentPage(1);
  };
  const handleTagChange = (tag) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    setCurrentPage(1);
  };

  // Filtrage Weekly/Monthly/Hourly (fictif)
  const [salaryType, setSalaryType] = useState('');
  const handleSalaryType = (type) => {
    setSalaryType(type);
    setCurrentPage(1);
  };

  // Fonction pour charger les offres (modifiée pour inclure la recherche)
  const fetchOffers = async (query = '') => {
    setLoading(true);
    try {
      const url = query
        ? `http://localhost:3000/api/joboffers/search?query=${query}`
        : 'http://localhost:3000/api/joboffers/';
      const res = await axios.get(url);
      console.log("API response data:", res.data); // Log des données reçues
      setOffers(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des offres:', err); // Log détaillé de l'erreur
      setError('Erreur lors du chargement des offres.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les offres au montage et lors du changement du terme de recherche
  useEffect(() => {
    fetchOffers(searchTerm);
  }, [searchTerm]); // Déclencher la recherche lorsque searchTerm change

  // Filtrage dynamique
  const filterOffers = (offers) => {
    const filtered = offers.filter((offer) => {
      // Location
      if (filters.location && !offer.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      // Job Type
      if (filters.type.length > 0 && !filters.type.includes(offer.contractType || 'Fulltime')) {
        return false;
      }
      // Experience
      if (filters.experience.length > 0 && !filters.experience.includes(offer.experience)) {
        return false;
      }
      // Category
      if (selectedCategories.length > 0 && !selectedCategories.includes(offer.category)) {
        return false;
      }
      // Tags
      if (selectedTags.length > 0 && (!offer.tags || !selectedTags.every(tag => offer.tags.includes(tag)))) {
        return false;
      }
      // Salary type (fictif)
      if (salaryType && (!offer.salaryType || offer.salaryType !== salaryType)) {
        return false;
      }
      // Salary (on prend le premier nombre trouvé dans salary)
      if (offer.salary) {
        const match = offer.salary.match(/\d+/);
        if (match) {
          const salaryNum = parseInt(match[0], 10);
          if (salaryNum < filters.salary[0] || salaryNum > filters.salary[1]) {
            return false;
          }
        }
      }
      return true;
    });
    console.log("Offers after filtering:", filtered.length, filtered); // Log après filtrage
    return filtered;
  };

  // Tri dynamique
  const sortOffers = (offers) => {
    if (sort === 'priceAsc') {
      return [...offers].sort((a, b) => {
        const aSalary = a.salary ? parseInt(a.salary.match(/\d+/)?.[0] || 0, 10) : 0;
        const bSalary = b.salary ? parseInt(b.salary.match(/\d+/)?.[0] || 0, 10) : 0;
        return aSalary - bSalary;
      });
    }
    if (sort === 'priceDesc') {
      return [...offers].sort((a, b) => {
        const aSalary = a.salary ? parseInt(a.salary.match(/\d+/)?.[0] || 0, 10) : 0;
        const bSalary = b.salary ? parseInt(b.salary.match(/\d+/)?.[0] || 0, 10) : 0;
        return bSalary - aSalary;
      });
    }
    console.log("Offers after sorting:", offers.length, offers); // Log après tri
    return offers;
  };

  const filteredOffers = sortOffers(filterOffers(offers));

  // Pagination logic
  const indexOfLastOffer = currentPage * offersPerPage;
  const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
  const currentOffers = filteredOffers.slice(indexOfFirstOffer, indexOfLastOffer);
  console.log("Offers for current page:", currentOffers.length, currentOffers); // Log des offres affichées
  const totalPages = Math.ceil(filteredOffers.length / offersPerPage);

  // Handlers pour les filtres
  const handleLocationChange = (e) => {
    setFilters((prev) => ({ ...prev, location: e.target.value }));
    setCurrentPage(1);
  };
  const handleTypeChange = (type) => {
    setFilters((prev) => {
      const already = prev.type.includes(type);
      return {
        ...prev,
        type: already ? prev.type.filter((t) => t !== type) : [...prev.type, type],
      };
    });
    setCurrentPage(1);
  };
  const handleExperienceChange = (exp) => {
    setFilters((prev) => {
      const already = prev.experience.includes(exp);
      return {
        ...prev,
        experience: already ? prev.experience.filter((e) => e !== exp) : [...prev.experience, exp],
      };
    });
    setCurrentPage(1);
  };
  const handleSalaryChange = (e) => {
    const value = Number(e.target.value);
    setSalaryRange([0, value]);
    setFilters((prev) => ({ ...prev, salary: [0, value] }));
    setCurrentPage(1);
  };
  const handleReset = () => {
    setFilters({ location: '', type: [], experience: [], salary: [0, 3500] });
    setSalaryRange([0, 3500]);
    setSort('');
    setCurrentPage(1);
  };
  // Tri
  const handleSortChange = (e) => {
    setSort(e.target.value);
    setCurrentPage(1);
  };

  // Modal
  const handleShowMore = (description) => {
    setModalContent(description);
    setModalOpen(true);
    setTimeout(() => setModalVisible(true), 10); // Pour l'animation
  };
  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setModalOpen(false), 200);
  };

  // Compteurs dynamiques pour chaque filtre
  const countByType = (type) => offers.filter((o) => (o.contractType || 'Fulltime') === type).length;
  const countByExperience = (exp) => offers.filter((o) => o.experience === exp).length;

  // Gestionnaire pour le changement du champ de recherche
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Réinitialiser la pagination lors de la recherche
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `url(${bgImage}) center center / cover no-repeat fixed`,
        padding: 100,
      }}
    >
      <Header />
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: isMobile ? 'center' : 'flex-start',
        px: isMobile ? 1 : 0,
        py: isMobile ? 2 : 0,
        gap: isMobile ? 3 : 0,
      }}>
        {/* Filtres */}
        <Paper elevation={0} sx={{
          width: isMobile ? '100%' : 320,
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          p: isMobile ? 2 : 3,
          mb: isMobile ? 3 : 0,
          mr: isMobile ? 0 : 4,
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          
        }}>
          {/* Champ de recherche ajouté ici */}
          <Box mb={2}>
            <Typography fontWeight={600} fontSize={16} mb={1}>Search Job</Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="Job Title, Keywords..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ bgcolor: '#fff', borderRadius: 2 }}
            />
          </Box>
          <Divider />
          {/* Location */}
          <Box mb={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography fontWeight={600} fontSize={16}>Location</Typography>
              <IconButton size="small" onClick={() => toggleSection('location')}>
                {expanded.location ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
              </IconButton>
            </Box>
            {expanded.location && (
              <TextField
                size="small"
                fullWidth
                placeholder="Spain, Barcelona"
                value={filters.location}
                onChange={handleLocationChange}
                sx={{ bgcolor: '#fff', borderRadius: 2 }}
              />
            )}
          </Box>
          <Divider />
          {/* Job Type */}
          <Box my={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography fontWeight={600} fontSize={16}>Job Type</Typography>
              <IconButton size="small" onClick={() => toggleSection('jobType')}>
                {expanded.jobType ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
              </IconButton>
            </Box>
            {expanded.jobType && jobTypes.map((type) => (
              <Box key={type} display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                <Box display="flex" alignItems="center">
                  <Checkbox
                    size="small"
                    checked={filters.type.includes(type)}
                    onChange={() => handleTypeChange(type)}
                  />
                  <Typography fontSize={15}>{type}</Typography>
                </Box>
                <Typography fontSize={15} color="text.secondary">{countByType(type)}</Typography>
              </Box>
            ))}
          </Box>
          <Divider />
          {/* Experience */}
          <Box my={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography fontWeight={600} fontSize={16}>Experience</Typography>
              <IconButton size="small" onClick={() => toggleSection('experience')}>
                {expanded.experience ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
              </IconButton>
            </Box>
            {expanded.experience && experienceTypes.map((exp) => (
              <Box key={exp} display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                <Box display="flex" alignItems="center">
                  <Checkbox
                    size="small"
                    checked={filters.experience.includes(exp)}
                    onChange={() => handleExperienceChange(exp)}
                  />
                  <Typography fontSize={15}>{exp}</Typography>
                </Box>
                <Typography fontSize={15} color="text.secondary">{countByExperience(exp)}</Typography>
              </Box>
            ))}
          </Box>
          <Divider />
          {/* Salary */}
          <Box my={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography fontWeight={600} fontSize={16}>Salary</Typography>
              <IconButton size="small" onClick={() => toggleSection('salary')}>
                {expanded.salary ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
              </IconButton>
            </Box>
            {expanded.salary && (
              <>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <TextField
                    size="small"
                    value={salaryRange[0]}
                    inputProps={{ min: 0, max: 3500, type: 'number', style: { width: 40, padding: 4 } }}
                    sx={{ width: 60, bgcolor: '#fff', borderRadius: 1 }}
                    disabled
                  />
                  <Typography fontSize={14}>-</Typography>
                  <TextField
                    size="small"
                    value={salaryRange[1]}
                    onChange={e => handleSalaryChange({ target: { value: e.target.value } })}
                    inputProps={{ min: 0, max: 3500, type: 'number', style: { width: 40, padding: 4 } }}
                    sx={{ width: 60, bgcolor: '#fff', borderRadius: 1 }}
                  />
                  <Typography fontSize={14}>DT</Typography>
                </Box>
                <Slider
                  min={0}
                  max={3500}
                  value={salaryRange[1]}
                  onChange={(e, val) => handleSalaryChange({ target: { value: val } })}
                  sx={{ color: '#1a1a1a' }}
                />
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Button size="small" variant={salaryType === 'Weekly' ? 'contained' : 'outlined'} onClick={() => handleSalaryType('Weekly')} sx={{ borderRadius: 2, minWidth: 80, color: salaryType === 'Weekly' ? '#fff' : '#1a1a1a', bgcolor: salaryType === 'Weekly' ? '#1a1a1a' : 'transparent', borderColor: '#1a1a1a', '&:hover': { bgcolor: '#166a53', color: '#fff' } }}>Weekly</Button>
                  <Button size="small" variant={salaryType === 'Monthly' ? 'contained' : 'outlined'} onClick={() => handleSalaryType('Monthly')} sx={{ borderRadius: 2, minWidth: 80, color: salaryType === 'Monthly' ? '#fff' : '#1a1a1a', bgcolor: salaryType === 'Monthly' ? '#1a1a1a' : 'transparent', borderColor: '#1a1a1a', '&:hover': { bgcolor: '#166a53', color: '#fff' } }}>Monthly</Button>
                  <Button size="small" variant={salaryType === 'Hourly' ? 'contained' : 'outlined'} onClick={() => handleSalaryType('Hourly')} sx={{ borderRadius: 2, minWidth: 80, color: salaryType === 'Hourly' ? '#fff' : '#1a1a1a', bgcolor: salaryType === 'Hourly' ? '#1a1a1a' : 'transparent', borderColor: '#1a1a1a', '&:hover': { bgcolor: '#166a53', color: '#fff' } }}>Hourly</Button>
                </Box>
              </>
            )}
          </Box>
          <Divider />
          {/* Category */}
          <Box my={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography fontWeight={600} fontSize={16}>Category</Typography>
              <IconButton size="small" onClick={() => toggleSection('category')}>
                {expanded.category ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
              </IconButton>
            </Box>
            {expanded.category && (
              <>
                {(showAllCategory ? categories : categories.slice(0, 6)).map((cat) => (
                  <Box key={cat} display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Box display="flex" alignItems="center">
                      <Checkbox size="small" checked={selectedCategories.includes(cat)} onChange={() => handleCategoryChange(cat)} />
                      <Typography fontSize={15}>{cat}</Typography>
                    </Box>
                    <Typography fontSize={15} color="text.secondary">{countByCategory(cat)}</Typography>
                  </Box>
                ))}
                {categories.length > 6 && (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setShowAllCategory((prev) => !prev)}
                    sx={{ bgcolor: '#e8f1fa', color: '#1976d2', borderRadius: 10, mt: 1, mb: 1, fontWeight: 500, '&:hover': { bgcolor: '#e8f1fa' } }}
                  >
                    {showAllCategory ? '− Show Less' : '+ Show More'}
                  </Button>
                )}
              </>
            )}
          </Box>
          <Divider />
          {/* Tags */}
          <Box my={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography fontWeight={600} fontSize={16}>Tags</Typography>
              <IconButton size="small" onClick={() => toggleSection('tags')}>
                {expanded.tags ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
              </IconButton>
            </Box>
            {expanded.tags && (
              <Box display="flex" flexWrap="wrap" gap={1}>
                {(showAllTags ? tags : tags.slice(0, 8)).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    clickable
                    onClick={() => handleTagChange(tag)}
                    color={selectedTags.includes(tag) ? 'success' : 'default'}
                    sx={{ bgcolor: selectedTags.includes(tag) ? '#e8f1fa' : '#e8f1fa', color: selectedTags.includes(tag) ? '#1976d2' : '#1976d2', fontWeight: 500, borderRadius: 10, fontSize: 14 }}
                  />
                ))}
                {tags.length > 8 && (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setShowAllTags((prev) => !prev)}
                    sx={{ bgcolor: '#e8f1fa', color: '#1976d2', borderRadius: 10, mt: 1, mb: 1, fontWeight: 500, '&:hover': { bgcolor: '#e8f1fa' } }}
                  >
                    {showAllTags ? '− Show Less' : '+ Show More'}
                  </Button>
                )}
              </Box>
            )}
          </Box>
          <Divider />
          <Button
            onClick={handleReset}
            fullWidth
            sx={{
              bgcolor: '#e8f1fa',
              color: '#1976d2',
              fontWeight: 600,
              borderRadius: 2,
              py: 1.2,
              mt: 2,
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(26,127,100,0.08)',
              '&:hover': { bgcolor: '#e8f1fa' },
            }}
          >
            Reset Filter
          </Button>
        </Paper>
        {/* Liste des offres */}
        <main style={{ flex: 1, maxWidth: 900 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            bgcolor: 'white',
            p: 3,
            borderRadius:5,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <Typography variant="body1" color="text.primary" fontWeight={500}>
              All {filteredOffers.length} jobs found
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Sort:</Typography>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Price Sort</InputLabel>
                <Select
                  label="Price Sort"
                  value={sort}
                  onChange={handleSortChange}
                  sx={{ 
                    borderRadius: '30px', 
                    borderColor: '#e0e0e0',
                    bgcolor: 'white'
                  }}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value="priceAsc">Price Low to High</MenuItem>
                  <MenuItem value="priceDesc">Price High to Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
          ) : error ? (
            <div style={{ color: 'red', textAlign: 'center', padding: 40 }}>{error}</div>
          ) : (
            <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
              {currentOffers.map((offer) => {
                // Temporairement, affichons l'objet offre en brut pour le débogage
                /* Code de débogage (commenté)
                return (
                  <div key={offer._id} style={{ background: '#fff', padding: 16, margin: 8, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <pre>{JSON.stringify(offer, null, 2)}</pre>
                  </div>
                );
                */
                // Code de la carte d'offre original (décommenté et mis à jour)
                const isActive = activeCardId === offer._id;

                // Adapter l'accès aux propriétés pour gérer les deux structures (ancienne et nouvelle)
                const title = offer.jobTitle || offer.title;
                const company = offer.employer || offer.company;
                const type = offer.jobType || offer.contractType || 'Fulltime';
                const description = offer.jobDescription || offer.description;

                // Adapter l'affichage de la localisation
                const locationDisplay = (offer.address && offer.country)
                  ? `${offer.address}, ${offer.country}`
                  : offer.address
                    ? offer.address
                    : offer.country
                      ? offer.country
                      : offer.location || ''; // Fallback to old location if new not present

                // Adapter l'affichage du salaire
                const salaryDisplay = (offer.minSalary && offer.maxSalary)
                  ? `${offer.minSalary} - ${offer.maxSalary} ${offer.salaryPeriod || ''}`.trim()
                  : offer.minSalary
                    ? `${offer.minSalary} ${offer.salaryPeriod || ''}`.trim()
                    : offer.maxSalary
                      ? `${offer.maxSalary} ${offer.salaryPeriod || ''}`.trim()
                      : offer.salary || ''; // Fallback to old salary if new not present

                return (
                  <div
                    key={offer._id}
                    style={{
                      background: '#fff',
                      borderRadius: 16,
                      padding: 24,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: 260,
                      boxShadow: isActive
                        ? '0 8px 32px rgba(26,127,100,0.18)'
                        : '0 4px 16px rgba(191,191,191,0.10)',
                      transform: isActive ? 'scale(1.025)' : 'scale(1)',
                      transition: 'box-shadow 0.18s, transform 0.18s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() => setActiveCardId(offer._id)}
                    onMouseLeave={() => setActiveCardId(null)}
                    onTouchStart={() => setActiveCardId(offer._id)}
                    onTouchEnd={() => setActiveCardId(null)}
                  >
                    {/* Utiliser les variables adaptées */}
                    <h3 style={{ fontWeight: 700, fontSize: 20, margin: '32px 0 8px 0' }}>{title}</h3>
                    <div style={{ color: '#1a1a1a', fontWeight: 600, marginBottom: 8 }}>{company}</div>
                    <span style={{ position: 'absolute', top: 16, left: 16, background: '#e6f4ea', color: '#1a1a1a', borderRadius: 8, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{type}</span>

                    <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>{locationDisplay}</div>
                    <div style={{ color: '#222', fontSize: 15, marginBottom: 8 }}>
                      {truncate(description || '', 90)}
                      {description && description.length > 90 && (
                        <button onClick={() => handleShowMore(description)} style={{ color: '#1a1a1a', background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer', fontWeight: 600 }}>
                          Voir plus
                        </button>
                      )}
                    </div>
                    <div style={{ color: '#1a1a1a', fontWeight: 600, marginBottom: 8 }}>{salaryDisplay}</div>
                    <button style={{ marginTop: 'auto', alignSelf: 'flex-end', background: '#e8f1fa', color: '#1976d2', border: 'none', borderRadius: 10, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>APPLY</button>
                  </div>
                );
              })}
            </div>
            {/* Pagination moderne */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentPage === 1 ? '#888' : '#1a1a1a',
                  fontSize: 22,
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                aria-label="Précédent"
              >
                &#60;
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                // Affichage intelligent avec ...
                if (
                  i === 0 ||
                  i === totalPages - 1 ||
                  (i >= currentPage - 2 && i <= currentPage + 0) ||
                  (currentPage <= 3 && i < 5) ||
                  (currentPage >= totalPages - 3 && i > totalPages - 6)
                ) {
                  return (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        margin: '0 2px',
                        fontWeight: currentPage === i + 1 ? 'bold' : 'normal',
                        background: currentPage === i + 1 ? '#444' : 'none',
                        color: currentPage === i + 1 ? '#fff' : '#222',
                        border: 'none',
                        borderRadius: '50%',
                        width: 36,
                        height: 36,
                        fontSize: 18,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        outline: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      aria-current={currentPage === i + 1 ? 'page' : undefined}
                    >
                      {i + 1}
                    </button>
                  );
                }
                // Afficher ... seulement si ce n'est pas déjà affiché
                if (
                  (i === 1 && currentPage > 4) ||
                  (i === totalPages - 2 && currentPage < totalPages - 3)
                ) {
                  return (
                    <span key={i} style={{ padding: '0 8px', color: '#888', fontSize: 18 }}>...</span>
                  );
                }
                return null;
              })}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentPage === totalPages ? '#888' : '#1a1a1a',
                  fontSize: 22,
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                aria-label="Suivant"
              >
                &#62;
              </button>
            </div>
            {/* Modal description amélioré */}
            {modalOpen && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                animation: modalVisible ? 'fadeIn 0.2s' : 'fadeOut 0.2s',
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f5f7fa 60%, #e6f4ea 100%)',
                  borderRadius: 18,
                  padding: '24px 48px',
                  maxWidth: 800,
                  width: '96%',
                  minHeight: 100,
                  maxHeight: 500,
                  overflowY: 'auto',
                  boxShadow: '0 12px 48px rgba(191, 191, 191, 0.18)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  transform: modalVisible ? 'scale(1)' : 'scale(0.85)',
                  opacity: modalVisible ? 1 : 0,
                  transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
                }}>
                  <button onClick={handleCloseModal} style={{
                    position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#1a1a1a', fontWeight: 700, transition: 'color 0.2s',
                  }} aria-label="Fermer">&times;</button>
                  <h2 style={{marginBottom: 16, color: '#1a1a1a', fontWeight: 700, fontSize: 24, letterSpacing: 2}}>Description complète</h2>
                  <div style={{ color: '#222', fontSize: 17, whiteSpace: 'pre-line', lineHeight: 1.6 }}>{modalContent}</div>
                </div>
              </div>
            )}
            </>
          )}
        </main>
      </Box>
    </div>
  );
};

export default Offers; 
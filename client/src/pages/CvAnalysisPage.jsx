import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';

export default function CvAnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { cvUrl, analysis } = location.state || {};

  if (!cvUrl || !analysis) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography color="error">Missing CV or analysis data</Typography>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </Paper>
    );
  }

  return (
    <Box display="flex" height="100vh">
      {/* PDF Viewer */}
      <Box flex={1} borderRight="1px solid #ccc">
        <iframe
          src={cvUrl}
          title="CV"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </Box>

      {/* Analysis */}
      <Box flex={1} p={4} overflow="auto">
        <Typography variant="h5" gutterBottom>
          CV Analysis
        </Typography>
        <Typography
          component="pre"
          style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
        >
          {analysis}
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>
    </Box>
  );
}

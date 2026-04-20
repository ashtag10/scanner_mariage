import React, { useState } from 'react';
import { Container, Card, CardContent, Box, Typography, TextField, Button, Alert, Fade, Zoom } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

interface LoginProps {
  onLogin: () => void;
}

const PIN_CORRECT = "0526";

const loginTheme = createTheme({
  palette: {
    primary: { main: '#005f57' },
    secondary: { main: '#e87433' },
  },
  typography: {
    fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
  },
  shape: {
    borderRadius: 16,
  },
});

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (pin === PIN_CORRECT) {
      onLogin();
    } else {
      setError('Code PIN incorrect');
    }
  };

  return (
    <ThemeProvider theme={loginTheme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://i.imgur.com/Y9eVOjg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Container maxWidth="sm">
          <Zoom in timeout={500}>
            <Card sx={{ borderRadius: 6, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.97)' }}>
              <Box sx={{ bgcolor: '#005f57', p: 3, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 400, letterSpacing: 2 }}>
                  Bedia & Carielle
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.85)', mt: 1, fontStyle: 'italic' }}>
                  Contrôle d'accès
                </Typography>
              </Box>
              <CardContent sx={{ p: 4 }}>
                <TextField
                  fullWidth
                  type="password"
                  label="Code Agent"
                  variant="outlined"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-input': {
                      fontSize: '1.2rem',
                      fontFamily: 'monospace',
                      letterSpacing: 2,
                    }
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1.1rem',
                    letterSpacing: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #005f57 0%, #008070 100%)',
                  }}
                >
                  ACCÉDER
                </Button>
                {error && (
                  <Fade in>
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Zoom>
        </Container>
      </Box>
    </ThemeProvider>
  );
};
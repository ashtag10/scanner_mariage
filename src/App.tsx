import { useState } from 'react';
import { Container, Paper, Box, Typography, Snackbar, TextField, Button, Fade, Zoom, CircularProgress } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Login } from './components/Login';
import { UploadScanner } from './components/UploadScanner';

interface Message {
  text: string;
  type: 'success' | 'error' | 'info';
}

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwWZAGVk2FsL933QFzS3LTt1YcOZQuiZI377rL2rZV34sPKB1myrVyjQqTGXAx5cUBC9Q/exec";

const theme = createTheme({
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

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [message, setMessage] = useState<Message | null>(null);

  const verifyCode = async (code: string) => {
    if (!code) {
      setMessage({ text: "Code non détecté, réessayez", type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: "Vérification en cours...", type: 'info' });

    let cleanCode = code.trim();
    if (cleanCode.startsWith('http')) {
      const parts = cleanCode.split('/');
      cleanCode = parts[parts.length - 1];
    }

    try {
      const url = `${GOOGLE_SCRIPT_URL}?code=${encodeURIComponent(cleanCode)}`;
      const response = await fetch(url);
      const result = await response.text();

      if (result.includes("✅")) {
        setMessage({ text: result, type: 'success' });
        setManualCode('');
        if (navigator.vibrate) navigator.vibrate(200);
      } else {
        setMessage({ text: result, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: "Erreur de connexion", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      setMessage({ text: "Veuillez entrer un code", type: 'error' });
      return;
    }
    verifyCode(manualCode.trim());
  };

  if (!authenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={() => setAuthenticated(true)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://i.imgur.com/Y9eVOjg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 2, sm: 4 },
      }}>
        <Container maxWidth="sm">
          <Zoom in timeout={500}>
            <Paper elevation={8} sx={{ 
              borderRadius: 6, 
              overflow: 'hidden', 
              bgcolor: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(2px)',
            }}>
              <Box sx={{ 
                bgcolor: '#005f57', 
                p: 3, 
                textAlign: 'center',
                position: 'relative',
                '&::after': {
                  content: '"✦"',
                  position: 'absolute',
                  bottom: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 24,
                  color: '#e87433',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
              }}>
                <Typography variant="h4" sx={{ color: 'white', letterSpacing: 2 }}>
                  Bedia & Carielle
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.85)', mt: 1, fontStyle: 'italic' }}>
                  Contrôle des Entrées
                </Typography>
              </Box>

              <Box sx={{ p: 4 }}>
                <Fade in timeout={800}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ color: '#005f57', mb: 1 }}>
                      🎟️ Scanner un billet
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                      Prenez une photo du QR code ou entrez le code manuellement
                    </Typography>
                  </Box>
                </Fade>

                <UploadScanner onScan={verifyCode} loading={loading} />

                <Box sx={{ textAlign: 'center', my: 3 }}>
                  <Typography variant="body2" sx={{ color: '#e87433' }}>— ou —</Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Code manuel"
                  variant="outlined"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  disabled={loading}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '&:hover fieldset': { borderColor: '#e87433' },
                    },
                    '& .MuiOutlinedInput-input': {
                      fontSize: '1.1rem',
                      fontFamily: 'monospace',
                      letterSpacing: 1,
                      textAlign: 'center',
                    }
                  }}
                  placeholder="Ex: 104"
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleManualSubmit}
                  disabled={loading}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1rem',
                    letterSpacing: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #e87433 0%, #d46228 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #d46228 0%, #c05520 100%)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'VALIDER LE CODE'}
                </Button>

                {message && (
                  <Box sx={{ 
                    mt: 3, 
                    p: 2, 
                    borderRadius: 3,
                    textAlign: 'center',
                    bgcolor: message.type === 'success' ? '#d4edda' : message.type === 'error' ? '#f8d7da' : '#d1ecf1',
                    color: message.type === 'success' ? '#155724' : message.type === 'error' ? '#721c24' : '#0c5460',
                  }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontStyle: 'italic' }}>
                      {message.text}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="caption" sx={{ color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <span>✦</span> Le bonheur est dans la salle <span>✦</span>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Zoom>
        </Container>

        <Snackbar
          open={loading}
          message="Vérification en cours..."
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
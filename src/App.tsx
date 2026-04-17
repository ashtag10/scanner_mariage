import { useState } from 'react';
import { Container, Paper, Box, Typography, Snackbar } from '@mui/material';
import { ThemeProvider, createTheme} from '@mui/material/styles';
import {CssBaseline} from '@mui/material';
import { Login } from './components/Login';
import { Scanner } from './components/Scanner';
import { ManualInput } from './components/ManualInput';

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
});

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const verifyCode = async (code: string) => {
    if (!code) {
      setMessage({ text: "QR Code non détecté, réessayez", type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: "Vérification en cours...", type: 'info' });

    let cleanCode = code.trim();
    if (cleanCode.startsWith('http')) {
      const parts = cleanCode.split('/');
      cleanCode = parts[parts.length - 1];
    }
    
    console.log("Code à vérifier:", cleanCode);

    try {
      // Utiliser fetch directement (CORS devrait être moins strict en HTTPS)
      const url = `${GOOGLE_SCRIPT_URL}?code=${encodeURIComponent(cleanCode)}`;
      console.log("URL appelée:", url);
      
      const response = await fetch(url);
      const result = await response.text();
      console.log("Réponse reçue:", result);

      if (result.includes("✅")) {
        setMessage({ text: result, type: 'success' });
        if (navigator.vibrate) navigator.vibrate(200);
      } else {
        setMessage({ text: result, type: 'error' });
      }
    } catch (error) {
      console.error("Erreur détaillée:", error);
      setMessage({ 
        text: "Erreur de connexion: " + (error as Error).message, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
          <Login onLogin={() => setAuthenticated(true)} />
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        backgroundImage: `url('https://i.imgur.com/Y9eVOjg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        py: { xs: 2, sm: 4 },
      }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.95)' }}>
            <Box sx={{ bgcolor: '#005f57', p: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                🎟️ Contrôle des Entrées
              </Typography>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Scanner onScan={verifyCode} loading={loading} message={message} />
              
              <Box sx={{ my: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="#e87433">— ou —</Typography>
              </Box>
              
              <ManualInput onVerify={verifyCode} loading={loading} />
            </Box>
          </Paper>

          <Snackbar
            open={loading}
            message="Vérification en cours..."
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
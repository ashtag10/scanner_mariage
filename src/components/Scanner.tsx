import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import { styled } from '@mui/material/styles';

interface Message {
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ScannerProps {
  onScan: (code: string) => void;
  loading: boolean;
  message: Message | null;
}

// Correction 1 : Supprimer 'theme' inutilisé
const StyledButton = styled(Button)(() => ({
  '&.scan-btn': {
    backgroundColor: '#005f57',
    '&:hover': { backgroundColor: '#004a43' },
  },
  '&.upload-btn': {
    backgroundColor: '#e87433',
    '&:hover': { backgroundColor: '#d46228' },
  },
  '&.stop-btn': {
    borderColor: '#e87433',
    color: '#e87433',
    '&:hover': { borderColor: '#005f57', color: '#005f57' },
  },
}));

export const Scanner: React.FC<ScannerProps> = ({ onScan, loading, message }) => {
  const [scanning, setScanning] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const cleanQRCode = (rawCode: string): string => {
    let cleanCode = rawCode.trim();
    if (cleanCode.startsWith('http')) {
      const parts = cleanCode.split('/');
      cleanCode = parts[parts.length - 1];
    }
    return cleanCode;
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    const element = document.getElementById('qr-reader');
    if (!element) return;
    
    element.innerHTML = '';
    setScanning(true);

    scannerRef.current = new Html5Qrcode('qr-reader');

    try {
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          const cleanCode = cleanQRCode(decodedText);
          onScan(cleanCode);
          stopScanner();
        },
        () => {} // Correction 2 : Supprimer le paramètre 'error' inutilisé
      );
    } catch (err) {
      console.error('Erreur caméra:', err);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const uploadPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // Correction 3 : Retirer la ligne 'capture' qui cause l'erreur TypeScript
    // input.capture = undefined; ← À supprimer complètement
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploadLoading(true);
      
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-scanner';
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('temp-scanner');
        const result = await scanner.scanFile(file, true);
        
        if (result) {
          const cleanCode = cleanQRCode(result);
          onScan(cleanCode);
        } else {
          onScan('');
        }
        
        await scanner.clear();
      } catch (err) {
        console.error('Erreur scan photo:', err);
        onScan('');
      } finally {
        document.body.removeChild(tempDiv);
        setUploadLoading(false);
        input.value = '';
      }
    };

    input.click();
  };

  return (
    <Box>
      {!scanning ? (
        <Box>
          <StyledButton
            fullWidth
            variant="contained"
            className="scan-btn"
            onClick={startScanner}
            disabled={loading || uploadLoading}
            sx={{ py: 2, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '📷 SCANNER EN DIRECT'}
          </StyledButton>
          
          <StyledButton
            fullWidth
            variant="contained"
            className="upload-btn"
            onClick={uploadPhoto}
            disabled={loading || uploadLoading}
            sx={{ py: 2 }}
          >
            {uploadLoading ? <CircularProgress size={24} color="inherit" /> : '🖼️ UPLOADER UNE PHOTO (GALERIE)'}
          </StyledButton>
        </Box>
      ) : (
        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 3 }}>
          <div id="qr-reader" style={{ width: '100%', borderRadius: '16px', overflow: 'hidden' }} />
          <StyledButton
            fullWidth
            variant="outlined"
            className="stop-btn"
            onClick={stopScanner}
            sx={{ mt: 2 }}
          >
            ⏹️ ARRÊTER LA CAMÉRA
          </StyledButton>
        </Paper>
      )}
      
      {message && (
        <Alert severity={message.type} sx={{ mt: 2, bgcolor: '#fff', color: message.type === 'success' ? '#005f57' : '#e87433' }}>
          {message.text}
        </Alert>
      )}
      
      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: '#fff' }}>
        💡 Scannez le QR code avec la caméra ou uploadez une photo depuis votre galerie
      </Typography>
    </Box>
  );
};
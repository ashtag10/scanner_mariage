import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Interface définie localement
interface Message {
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ScannerProps {
  onScan: (code: string) => void;
  loading: boolean;
  message: Message | null;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, loading, message }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanner = () => {
    const element = document.getElementById('qr-reader');
    if (element) {
      element.innerHTML = '';
    }

    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        stopScanner();
      },
      (error) => {}
    );

    setCameraActive(true);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  const prendrePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setPhotoLoading(true);

      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-scanner';
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('temp-scanner');
        const result = await scanner.scanFile(file, true);
        
        if (result) {
          onScan(result);
        } else {
          onScan('');
        }
        
        await scanner.clear();
      } catch (err) {
        console.error('Scan error:', err);
        onScan('');
      } finally {
        document.body.removeChild(tempDiv);
        setPhotoLoading(false);
        input.value = '';
      }
    };

    input.click();
  };

  return (
    <Box>
      {!cameraActive ? (
        <Box>
          <Button
            fullWidth
            variant="contained"
            onClick={startScanner}
            disabled={loading || photoLoading}
            sx={{ 
              py: 2, 
              mb: 2, 
              bgcolor: '#28a745',
              '&:hover': { bgcolor: '#218838' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '📷 SCANNER EN DIRECT'}
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={prendrePhoto}
            disabled={loading || photoLoading}
            sx={{ py: 2 }}
          >
            {photoLoading ? <CircularProgress size={24} /> : '📸 PRENDRE UNE PHOTO'}
          </Button>
        </Box>
      ) : (
        <Box>
          <div 
            id="qr-reader" 
            style={{ 
              width: '100%', 
              borderRadius: '16px',
              overflow: 'hidden'
            }} 
          />
          <Button
            fullWidth
            variant="outlined"
            onClick={stopScanner}
            disabled={loading}
            sx={{ 
              mt: 2, 
              color: 'error.main',
              borderColor: 'error.main',
              '&:hover': { borderColor: 'error.dark', bgcolor: 'error.lighter' }
            }}
          >
            ⏹️ ARRÊTER LA CAMÉRA
          </Button>
        </Box>
      )}
      
      {message && (
        <Alert severity={message.type} sx={{ mt: 2 }}>
          {message.text}
        </Alert>
      )}
      
      <Typography 
        variant="caption" 
        color="textSecondary" 
        sx={{ 
          display: 'block', 
          textAlign: 'center', 
          mt: 2,
          fontSize: '0.7rem'
        }}
      >
        💡 Placez le QR code devant la caméra pour un scan automatique
        <br />
        ou prenez une photo nette du QR code
      </Typography>
    </Box>
  );
};
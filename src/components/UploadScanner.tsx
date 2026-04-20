import React, { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Html5Qrcode } from 'html5-qrcode';
import heic2any from 'heic2any';

interface UploadScannerProps {
  onScan: (code: string) => void;
  loading: boolean;
}

const StyledButton = styled(Button)(() => ({
  backgroundColor: '#005f57',
  '&:hover': { backgroundColor: '#004a43' },
  padding: '12px 24px',
  fontSize: '1.1rem',
  borderRadius: 30,
}));

export const UploadScanner: React.FC<UploadScannerProps> = ({ onScan, loading }) => {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    const isHeic = file.type === 'image/heic' || 
                   file.type === 'image/heif' || 
                   file.name.toLowerCase().endsWith('.heic') ||
                   file.name.toLowerCase().endsWith('.heif');
    
    if (isHeic) {
      try {
        const blob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8,
        });
        return new File([blob as Blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
      } catch (err) {
        console.error('Erreur conversion HEIC:', err);
        return file;
      }
    }
    return file;
  };

  const preprocessImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 800;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            reject(new Error('Impossible de convertir l\'image'));
          }
        }, 'image/jpeg', 0.9);
      };
      
      img.onerror = () => reject(new Error('Erreur de chargement de l\'image'));
      img.src = url;
    });
  };

  const uploadPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      let file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploadLoading(true);
      setError(null);
      
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-scanner';
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      try {
        file = await convertHeicToJpeg(file);
        const processedFile = await preprocessImage(file);
        
        const scanner = new Html5Qrcode('temp-scanner');
        let result = await scanner.scanFile(processedFile, true);
        
        if (!result) {
          result = await scanner.scanFile(file, true);
        }
        
        if (result) {
          onScan(result);
        } else {
          setError("QR Code non détecté. Essayez une photo plus nette et bien éclairée.");
        }
        
        await scanner.clear();
      } catch (err) {
        console.error('Erreur scan photo:', err);
        setError("Erreur lors de l'analyse. Vérifiez que le QR code est bien visible.");
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
      <StyledButton
        fullWidth
        variant="contained"
        onClick={uploadPhoto}
        disabled={loading || uploadLoading}
        startIcon={uploadLoading ? <CircularProgress size={20} color="inherit" /> : '📸'}
      >
        {uploadLoading ? 'ANALYSE EN COURS...' : 'PRENDRE UNE PHOTO DU QR CODE'}
      </StyledButton>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: '#666' }}>
        💡 Placez le QR code bien éclairé et cadrez-le entièrement
      </Typography>
    </Box>
  );
};
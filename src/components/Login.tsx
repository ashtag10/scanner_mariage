import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

interface LoginProps {
  onLogin: () => void;
}

const PIN_CORRECT = "0526";

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
    <Card sx={{ width: '100%', maxWidth: 400, borderRadius: 4 }}>
      <Box sx={{ bgcolor: 'primary.main', p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          🎟️ Bedia & Carielle
        </Typography>
        <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
          Contrôle d'accès
        </Typography>
      </Box>
      <CardContent sx={{ p: 3 }}>
        <TextField
          fullWidth
          type="password"
          label="Code PIN Agent"
          variant="outlined"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          sx={{ mb: 2 }}
        />
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          sx={{ bgcolor: 'primary.main', py: 1.5 }}
        >
          SE CONNECTER
        </Button>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
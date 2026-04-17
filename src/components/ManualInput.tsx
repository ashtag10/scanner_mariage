import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

interface ManualInputProps {
  onVerify: (code: string) => void;
  loading: boolean;
}

export const ManualInput: React.FC<ManualInputProps> = ({ onVerify, loading }) => {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    if (code.trim()) {
      onVerify(code.trim());
      setCode('');
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        ⌨️ Saisie manuelle
      </Typography>
      <TextField
        fullWidth
        label="Code du billet"
        variant="outlined"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        disabled={loading}
        sx={{ mb: 2 }}
      />
      <Button
        fullWidth
        variant="contained"
        color="secondary"
        onClick={handleSubmit}
        disabled={loading}
        sx={{ py: 1.5 }}
      >
        VÉRIFIER
      </Button>
    </Box>
  );
};
import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { Security } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function MFAVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyMFALogin, isLoading } = useAuth();
  const { showNotification } = useNotification();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const email = location.state?.email;
  const from = location.state?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Session expired. Please login again.');
      return;
    }

    try {
      await verifyMFALogin(email, code);
      showNotification('Welcome back!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid verification code');
    }
  };

  if (!email) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Session Expired
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please login again to continue.
          </Typography>
          <Button component={RouterLink} to="/login" variant="contained">
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Security sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Two-Factor Authentication
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter the code from your authenticator app
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            required
            inputProps={{ maxLength: 6 }}
            placeholder="000000"
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || code.length !== 6}
            sx={{ mb: 2 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Verify'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" underline="hover">
              Back to Login
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

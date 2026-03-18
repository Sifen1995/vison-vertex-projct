import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { QrCode2, Security } from '@mui/icons-material';
import { authApi } from '../../api/auth';
import { useNotification } from '../../context/NotificationContext';

const steps = ['Generate QR Code', 'Verify Setup'];

export default function MFASetupPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [activeStep, setActiveStep] = useState(0);
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.setupMFA();
      setQrCode(response.qr_code);
      setSecret(response.secret);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authApi.verifyMFA({ code: verificationCode });
      showNotification('MFA enabled successfully!', 'success');
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Security sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Set Up Two-Factor Authentication
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add an extra layer of security to your account
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Box sx={{ textAlign: 'center' }}>
            {isLoading ? (
              <CircularProgress />
            ) : qrCode ? (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 3,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                  }}
                >
                  <img
                    src={qrCode}
                    alt="MFA QR Code"
                    style={{ maxWidth: 200, height: 'auto' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mb: 3 }}>
                  Or enter this code manually: <strong>{secret}</strong>
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(1)}
                >
                  Continue
                </Button>
              </>
            ) : (
              <Box>
                <QrCode2 sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
                <Typography color="text.secondary">
                  Failed to generate QR code
                </Typography>
                <Button onClick={generateQRCode} sx={{ mt: 2 }}>
                  Try Again
                </Button>
              </Box>
            )}
          </Box>
        )}

        {activeStep === 1 && (
          <Box component="form" onSubmit={handleVerify}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Enter the 6-digit code from your authenticator app to verify setup
            </Typography>
            <TextField
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
                fullWidth
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Verify & Enable'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

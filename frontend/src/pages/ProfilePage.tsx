import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Security,
  ShoppingBag,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth();
  const { showNotification } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await updateProfile(formData);
      showNotification('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: 28,
                }}
              >
                {getInitials()}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Personal Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={isEditing ? formData.first_name : user?.first_name || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Person color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={isEditing ? formData.last_name : user?.last_name || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={user?.email || ''}
                    disabled
                    InputProps={{
                      startAdornment: <Email color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={isEditing ? formData.phone : user?.phone || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Phone color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                {isEditing ? (
                  <>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          first_name: user?.first_name || '',
                          last_name: user?.last_name || '',
                          phone: user?.phone || '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 0 }}>
            <Typography variant="h6" fontWeight={600} sx={{ p: 3, pb: 2 }}>
              Quick Actions
            </Typography>
            <List disablePadding>
              <ListItem
                component={RouterLink}
                to="/orders"
                sx={{
                  borderTop: 1,
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'grey.50' },
                }}
              >
                <ListItemIcon>
                  <ShoppingBag />
                </ListItemIcon>
                <ListItemText
                  primary="My Orders"
                  secondary="View order history"
                />
              </ListItem>

              <ListItem
                component={RouterLink}
                to="/mfa-setup"
                sx={{
                  borderTop: 1,
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'grey.50' },
                }}
              >
                <ListItemIcon>
                  <Security />
                </ListItemIcon>
                <ListItemText
                  primary="Two-Factor Auth"
                  secondary={user?.mfa_enabled ? 'Enabled' : 'Set up now'}
                />
                <ListItemSecondaryAction>
                  <Switch checked={user?.mfa_enabled || false} disabled />
                </ListItemSecondaryAction>
              </ListItem>

              {user?.role === 1 && (
                <ListItem
                  component={RouterLink}
                  to="/admin"
                  sx={{
                    borderTop: 1,
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'grey.50' },
                  }}
                >
                  <ListItemIcon>
                    <Settings />
                  </ListItemIcon>
                  <ListItemText
                    primary="Admin Dashboard"
                    secondary="Manage your store"
                  />
                </ListItem>
              )}
            </List>
          </Paper>

          {/* Account Stats */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Account Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Account Type</Typography>
                <Typography fontWeight={600}>
                  {user?.role === 1 ? 'Admin / Seller' : 'Customer'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Seller Verified</Typography>
                <Typography fontWeight={600}>
                  {user?.seller_verified ? 'Yes' : 'No'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">MFA Status</Typography>
                <Typography fontWeight={600} color={user?.mfa_enabled ? 'success.main' : 'warning.main'}>
                  {user?.mfa_enabled ? 'Enabled' : 'Disabled'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

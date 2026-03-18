import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from '@mui/material';
import { ShoppingBag, ArrowBack } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ordersApi } from '../../api/orders';

const steps = ['Shipping Information', 'Review Order', 'Payment'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shippingInfo, setShippingInfo] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  });

  const shippingCost = totalPrice >= 1000 ? 0 : 50;
  const orderTotal = totalPrice + shippingCost;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(price);
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const validateShipping = () => {
    const required = ['first_name', 'last_name', 'email', 'phone', 'address', 'city'];
    for (const field of required) {
      if (!shippingInfo[field as keyof typeof shippingInfo]) {
        setError(`Please fill in ${field.replace('_', ' ')}`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (activeStep === 0 && !validateShipping()) {
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const orderData = {
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shipping_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip_code}`,
        total_amount: orderTotal,
      };

      const response = await ordersApi.create(orderData);

      // If payment URL is returned, redirect to Chapa
      if (response.payment_url) {
        window.location.href = response.payment_url;
        return;
      }

      // Otherwise, order is created successfully
      clearCart();
      showNotification('Order placed successfully!', 'success');
      navigate(`/orders/${response.order_id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 100, color: 'grey.300', mb: 3 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Your Cart is Empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Add items to your cart before checking out.
          </Typography>
          <Button
            component={RouterLink}
            to="/products"
            variant="contained"
            size="large"
          >
            Browse Products
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/cart')}
        sx={{ mb: 3 }}
      >
        Back to Cart
      </Button>

      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
        Checkout
      </Typography>

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

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            {/* Step 1: Shipping Information */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Shipping Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="first_name"
                      value={shippingInfo.first_name}
                      onChange={handleShippingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="last_name"
                      value={shippingInfo.last_name}
                      onChange={handleShippingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={handleShippingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleShippingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleShippingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="State/Region"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleShippingChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      name="zip_code"
                      value={shippingInfo.zip_code}
                      onChange={handleShippingChange}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 2: Review Order */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Review Your Order
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Shipping to:
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {shippingInfo.first_name} {shippingInfo.last_name}<br />
                  {shippingInfo.address}<br />
                  {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip_code}<br />
                  {shippingInfo.phone}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Order Items:
                </Typography>
                <List disablePadding>
                  {items.map((item) => (
                    <ListItem key={item.product.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={item.product.image}
                          alt={item.product.name}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.product.name}
                        secondary={`Qty: ${item.quantity}`}
                      />
                      <Typography variant="body1" fontWeight={600}>
                        {formatPrice(item.product.price * item.quantity)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Step 3: Payment */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Payment
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  You will be redirected to Chapa to complete your payment securely.
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  By clicking "Place Order", you agree to our terms and conditions.
                  Your payment will be processed securely through Chapa payment gateway.
                </Typography>
              </Box>
            )}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>
                  Continue
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Place Order'}
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Order Summary Sidebar */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Order Summary
            </Typography>

            <List dense disablePadding>
              {items.map((item) => (
                <ListItem key={item.product.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={item.product.name}
                    secondary={`x${item.quantity}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                  <Typography variant="body2">
                    {formatPrice(item.product.price * item.quantity)}
                  </Typography>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>{formatPrice(totalPrice)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Shipping</Typography>
              <Typography color={shippingCost === 0 ? 'success.main' : 'inherit'}>
                {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                {formatPrice(orderTotal)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

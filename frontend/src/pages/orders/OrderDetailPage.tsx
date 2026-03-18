import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Skeleton,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { ArrowBack, LocalShipping, Payment, CheckCircle } from '@mui/icons-material';
import { ordersApi } from '../../api/orders';
import { Order } from '../../types';

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

const statusColors: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await ordersApi.getById(id);
        setOrder(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load order');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActiveStep = (status: string) => {
    const index = statusSteps.indexOf(status);
    return index === -1 ? 0 : index;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Order not found'}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/orders')}
        sx={{ mb: 3 }}
      >
        Back to Orders
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Order #{order.id.slice(0, 8)}
        </Typography>
        <Chip
          label={order.status}
          color={statusColors[order.status] || 'default'}
          sx={{ textTransform: 'capitalize' }}
        />
      </Box>

      {/* Order Status Stepper */}
      {order.status !== 'cancelled' && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={getActiveStep(order.status)} alternativeLabel>
            {statusSteps.map((step) => (
              <Step key={step}>
                <StepLabel>
                  <Typography sx={{ textTransform: 'capitalize' }}>{step}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Order Items */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Order Items
            </Typography>
            <List disablePadding>
              {order.items?.map((item, index) => (
                <ListItem
                  key={index}
                  sx={{
                    px: 0,
                    borderBottom: index < (order.items?.length || 0) - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      src={item.product?.image}
                      alt={item.product?.name}
                      sx={{ width: 60, height: 60 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        component={RouterLink}
                        to={`/products/${item.product_id}`}
                        fontWeight={600}
                        sx={{
                          textDecoration: 'none',
                          color: 'text.primary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        {item.product?.name || 'Product'}
                      </Typography>
                    }
                    secondary={`Quantity: ${item.quantity}`}
                    sx={{ ml: 2 }}
                  />
                  <Typography fontWeight={600}>
                    {formatPrice(item.price * item.quantity)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Shipping Information */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LocalShipping color="action" />
              <Typography variant="h6" fontWeight={600}>
                Shipping Information
              </Typography>
            </Box>
            <Typography variant="body1">
              {order.shipping_address || 'No shipping address provided'}
            </Typography>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Order Summary
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Order Date</Typography>
              <Typography>{formatDate(order.created_at)}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>{formatPrice(order.total_amount)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Shipping</Typography>
              <Typography color="success.main">FREE</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                {formatPrice(order.total_amount)}
              </Typography>
            </Box>

            {/* Payment Status */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {order.payment_status === 'paid' ? (
                  <>
                    <CheckCircle color="success" />
                    <Typography fontWeight={600} color="success.main">
                      Payment Completed
                    </Typography>
                  </>
                ) : (
                  <>
                    <Payment color="warning" />
                    <Typography fontWeight={600} color="warning.main">
                      Payment {order.payment_status || 'Pending'}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

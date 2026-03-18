import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
} from '@mui/material';
import { Add, Remove, Delete, ShoppingBag, ArrowBack } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(price);
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
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
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button
            component={RouterLink}
            to="/products"
            variant="contained"
            size="large"
            startIcon={<ArrowBack />}
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
        Shopping Cart ({items.length} items)
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} lg={8}>
          <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="center">Subtotal</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.product.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          variant="rounded"
                          src={item.product.image}
                          alt={item.product.name}
                          sx={{ width: 80, height: 80 }}
                        />
                        <Box>
                          <Typography
                            component={RouterLink}
                            to={`/products/${item.product.id}`}
                            variant="subtitle2"
                            fontWeight={600}
                            sx={{
                              textDecoration: 'none',
                              color: 'text.primary',
                              '&:hover': { color: 'primary.main' },
                            }}
                          >
                            {item.product.name}
                          </Typography>
                          {item.product.stock < 10 && (
                            <Typography variant="caption" color="warning.main">
                              Only {item.product.stock} left
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600}>
                        {formatPrice(item.product.price)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography sx={{ mx: 2, minWidth: 24, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={700} color="primary">
                        {formatPrice(item.product.price * item.quantity)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              component={RouterLink}
              to="/products"
              startIcon={<ArrowBack />}
            >
              Continue Shopping
            </Button>
            <Button color="error" onClick={clearCart}>
              Clear Cart
            </Button>
          </Box>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Order Summary
            </Typography>

            <Box sx={{ my: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">
                  Subtotal ({items.length} items)
                </Typography>
                <Typography fontWeight={600}>{formatPrice(totalPrice)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Shipping</Typography>
                <Typography fontWeight={600} color="success.main">
                  {totalPrice >= 1000 ? 'FREE' : formatPrice(50)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                {formatPrice(totalPrice < 1000 ? totalPrice + 50 : totalPrice)}
              </Typography>
            </Box>

            {totalPrice < 1000 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add {formatPrice(1000 - totalPrice)} more for free shipping!
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCheckout}
              sx={{ mb: 2 }}
            >
              Proceed to Checkout
            </Button>

            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
              Secure checkout powered by Chapa
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

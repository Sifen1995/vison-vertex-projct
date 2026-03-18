import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  Avatar,
  Stack,
} from '@mui/material';
import { Close, Add, Remove, Delete, ShoppingBag } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, clearCart } =
    useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(price);
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={closeCart}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Shopping Cart ({items.length})
          </Typography>
          <IconButton onClick={closeCart}>
            <Close />
          </IconButton>
        </Box>

        {/* Cart Items */}
        {items.length === 0 ? (
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <ShoppingBag sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add items to get started
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                closeCart();
                navigate('/products');
              }}
            >
              Browse Products
            </Button>
          </Box>
        ) : (
          <>
            <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
              {items.map((item) => (
                <ListItem
                  key={item.product.id}
                  sx={{
                    py: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Avatar
                    variant="rounded"
                    src={item.product.image}
                    alt={item.product.name}
                    sx={{ width: 80, height: 80, mr: 2 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      {formatPrice(item.product.price)}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" sx={{ minWidth: 24, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                </ListItem>
              ))}
            </List>

            {/* Footer */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1">Subtotal</Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {formatPrice(totalPrice)}
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCheckout}
                sx={{ mb: 1 }}
              >
                Checkout
              </Button>
              <Button
                variant="outlined"
                fullWidth
                color="inherit"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}

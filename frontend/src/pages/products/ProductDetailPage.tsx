import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  Skeleton,
  Breadcrumbs,
  Link,
  TextField,
  Paper,
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  Add,
  Remove,
  ArrowBack,
  LocalShipping,
  Security,
  Verified,
} from '@mui/icons-material';
import { productsApi } from '../../api/products';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showNotification } = useNotification();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await productsApi.getById(id);
        setProduct(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    showNotification(`${quantity} x ${product.name} added to cart`, 'success');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(price);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={48} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" height={40} width="40%" sx={{ mt: 2 }} />
            <Skeleton variant="rectangular" height={100} sx={{ mt: 3 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Product not found'}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/products" underline="hover" color="inherit">
          Products
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              overflow: 'hidden',
              borderRadius: 2,
              bgcolor: 'grey.100',
            }}
          >
            <Box
              component="img"
              src={product.image || '/placeholder.jpg'}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 500,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Paper>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {product.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {product.category && (
                <Chip label={product.category} size="small" variant="outlined" />
              )}
              {product.seller_verified && (
                <Chip
                  icon={<Verified />}
                  label="Verified Seller"
                  size="small"
                  color="success"
                />
              )}
            </Box>

            <Typography variant="h4" color="primary" fontWeight={800} sx={{ mb: 3 }}>
              {formatPrice(product.price)}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
              {product.description}
            </Typography>

            {/* Stock Status */}
            <Box sx={{ mb: 3 }}>
              {product.stock === 0 ? (
                <Alert severity="error">Out of Stock</Alert>
              ) : product.stock < 10 ? (
                <Alert severity="warning">
                  Only {product.stock} items left in stock!
                </Alert>
              ) : (
                <Alert severity="success" icon={false}>
                  In Stock ({product.stock} available)
                </Alert>
              )}
            </Box>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Quantity:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    sx={{ minWidth: 40 }}
                  >
                    <Remove />
                  </Button>
                  <TextField
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1 && val <= product.stock) {
                        setQuantity(val);
                      }
                    }}
                    inputProps={{
                      min: 1,
                      max: product.stock,
                      style: { textAlign: 'center' },
                    }}
                    sx={{ width: 80, mx: 1 }}
                    size="small"
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    sx={{ minWidth: 40 }}
                  >
                    <Add />
                  </Button>
                </Box>
              </Box>
            )}

            {/* Add to Cart Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              sx={{ py: 1.5, mb: 3 }}
            >
              Add to Cart - {formatPrice(product.price * quantity)}
            </Button>

            <Divider sx={{ my: 3 }} />

            {/* Features */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocalShipping color="action" />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Free Shipping
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    On orders over 1000 ETB
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Security color="action" />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Secure Payment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your payment is protected
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Product Details Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Product Details
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Category
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {product.category || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Stock
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {product.stock} units
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                SKU
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {product.sku || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Seller
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {product.seller_verified ? 'Verified' : 'Standard'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}

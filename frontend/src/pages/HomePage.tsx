import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Skeleton,
} from '@mui/material';
import { ArrowForward, ShoppingCart, LocalShipping, Security, Support } from '@mui/icons-material';
import { productsApi } from '../api/products';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const features = [
  {
    icon: <LocalShipping sx={{ fontSize: 40 }} />,
    title: 'Free Shipping',
    description: 'On orders over 1000 ETB',
  },
  {
    icon: <Security sx={{ fontSize: 40 }} />,
    title: 'Secure Payment',
    description: 'Protected by Chapa',
  },
  {
    icon: <Support sx={{ fontSize: 40 }} />,
    title: '24/7 Support',
    description: 'Always here to help',
  },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.getAll({ page: 1, page_size: 8 });
        setFeaturedProducts(response.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem(product);
    showNotification(`${product.name} added to cart`, 'success');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(price);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                fontWeight={800}
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                  mb: 2,
                }}
              >
                Discover Amazing Products
              </Typography>
              <Typography
                variant="h6"
                sx={{ opacity: 0.8, mb: 4, fontWeight: 400 }}
              >
                Shop the latest trends with secure payments and fast delivery across Ethiopia
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component={RouterLink}
                  to="/products"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  Shop Now
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Join Us
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #00c853, #00bcd4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingCart sx={{ fontSize: 120, color: 'white' }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                }}
              >
                <Box sx={{ color: 'primary.main' }}>{feature.icon}</Box>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={700}>
            Featured Products
          </Typography>
          <Button
            component={RouterLink}
            to="/products"
            endIcon={<ArrowForward />}
          >
            View All
          </Button>
        </Box>

        <Grid container spacing={3}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={28} />
                      <Skeleton variant="text" width="60%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : featuredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height={200}
                      image={product.image || '/placeholder.jpg'}
                      alt={product.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        component={RouterLink}
                        to={`/products/${product.id}`}
                        sx={{
                          textDecoration: 'none',
                          color: 'text.primary',
                          '&:hover': { color: 'primary.main' },
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Typography variant="h6" color="primary" fontWeight={700}>
                          {formatPrice(product.price)}
                        </Typography>
                        {product.stock < 10 && product.stock > 0 && (
                          <Chip label="Low Stock" size="small" color="warning" />
                        )}
                        {product.stock === 0 && (
                          <Chip label="Out of Stock" size="small" color="error" />
                        )}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={product.stock === 0}
                        onClick={() => handleAddToCart(product)}
                        startIcon={<ShoppingCart />}
                      >
                        Add to Cart
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8, mt: 6 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Ready to Start Selling?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 4 }}>
            Join our marketplace and reach thousands of customers across Ethiopia
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            Become a Seller
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

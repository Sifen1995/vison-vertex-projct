import { Box, Container, Typography, Link, Grid, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              ShopVerse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your one-stop destination for quality products at great prices.
              Shop with confidence and enjoy fast delivery.
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Shop
            </Typography>
            <Link
              component={RouterLink}
              to="/products"
              color="text.secondary"
              underline="hover"
              display="block"
              sx={{ mb: 1 }}
            >
              All Products
            </Link>
            <Link
              component={RouterLink}
              to="/products?category=electronics"
              color="text.secondary"
              underline="hover"
              display="block"
              sx={{ mb: 1 }}
            >
              Electronics
            </Link>
            <Link
              component={RouterLink}
              to="/products?category=clothing"
              color="text.secondary"
              underline="hover"
              display="block"
              sx={{ mb: 1 }}
            >
              Clothing
            </Link>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Account
            </Typography>
            <Link
              component={RouterLink}
              to="/login"
              color="text.secondary"
              underline="hover"
              display="block"
              sx={{ mb: 1 }}
            >
              Login
            </Link>
            <Link
              component={RouterLink}
              to="/register"
              color="text.secondary"
              underline="hover"
              display="block"
              sx={{ mb: 1 }}
            >
              Register
            </Link>
            <Link
              component={RouterLink}
              to="/orders"
              color="text.secondary"
              underline="hover"
              display="block"
              sx={{ mb: 1 }}
            >
              My Orders
            </Link>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Support
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Email: support@shopverse.com
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Phone: +251 911 123 456
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hours: Mon-Fri 9AM-6PM
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          &copy; {new Date().getFullYear()} ShopVerse. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

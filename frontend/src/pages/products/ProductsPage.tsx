import { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Skeleton,
  Pagination,
  Paper,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search,
  FilterList,
  ShoppingCart,
  Close,
} from '@mui/icons-material';
import { productsApi } from '../../api/products';
import { Product, PaginationMeta } from '../../types';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';

export default function ProductsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort_by: searchParams.get('sort_by') || 'created_at',
    sort_order: searchParams.get('sort_order') || 'desc',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  const { addItem } = useCart();
  const { showNotification } = useNotification();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: filters.page,
        page_size: 12,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.min_price) params.min_price = parseFloat(filters.min_price);
      if (filters.max_price) params.max_price = parseFloat(filters.max_price);
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.sort_order) params.sort_order = filters.sort_order;

      const response = await productsApi.getAll(params);
      setProducts(response.products || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showNotification('Failed to load products', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, showNotification]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.min_price) params.set('min_price', filters.min_price);
    if (filters.max_price) params.set('max_price', filters.max_price);
    if (filters.sort_by !== 'created_at') params.set('sort_by', filters.sort_by);
    if (filters.sort_order !== 'desc') params.set('sort_order', filters.sort_order);
    if (filters.page > 1) params.set('page', filters.page.toString());
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      min_price: '',
      max_price: '',
      sort_by: 'created_at',
      sort_order: 'desc',
      page: 1,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.min_price ||
    filters.max_price;

  const FilterPanel = () => (
    <Box sx={{ p: isMobile ? 2 : 0 }}>
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Filters
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>
      )}

      <TextField
        fullWidth
        placeholder="Search products..."
        value={filters.search}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={filters.category}
          label="Category"
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <MenuItem value="">All Categories</MenuItem>
          <MenuItem value="electronics">Electronics</MenuItem>
          <MenuItem value="clothing">Clothing</MenuItem>
          <MenuItem value="home">Home & Garden</MenuItem>
          <MenuItem value="sports">Sports</MenuItem>
        </Select>
      </FormControl>

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Price Range
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          placeholder="Min"
          type="number"
          value={filters.min_price}
          onChange={(e) => handleFilterChange('min_price', e.target.value)}
          size="small"
        />
        <TextField
          placeholder="Max"
          type="number"
          value={filters.max_price}
          onChange={(e) => handleFilterChange('max_price', e.target.value)}
          size="small"
        />
      </Box>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={filters.sort_by}
          label="Sort By"
          onChange={(e) => handleFilterChange('sort_by', e.target.value)}
        >
          <MenuItem value="created_at">Newest</MenuItem>
          <MenuItem value="price">Price</MenuItem>
          <MenuItem value="name">Name</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Order</InputLabel>
        <Select
          value={filters.sort_order}
          label="Order"
          onChange={(e) => handleFilterChange('sort_order', e.target.value)}
        >
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </Select>
      </FormControl>

      {hasActiveFilters && (
        <Button fullWidth variant="outlined" onClick={clearFilters}>
          Clear Filters
        </Button>
      )}

      {isMobile && (
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => setFilterDrawerOpen(false)}
        >
          Apply Filters
        </Button>
      )}
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Products
        </Typography>
        {isMobile && (
          <Button
            startIcon={<FilterList />}
            onClick={() => setFilterDrawerOpen(true)}
            variant="outlined"
          >
            Filters
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Filters Sidebar - Desktop */}
        {!isMobile && (
          <Grid item md={3}>
            <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Filters
              </Typography>
              <FilterPanel />
            </Paper>
          </Grid>
        )}

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {hasActiveFilters && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {filters.search && (
                <Chip
                  label={`Search: ${filters.search}`}
                  onDelete={() => handleFilterChange('search', '')}
                />
              )}
              {filters.category && (
                <Chip
                  label={`Category: ${filters.category}`}
                  onDelete={() => handleFilterChange('category', '')}
                />
              )}
              {(filters.min_price || filters.max_price) && (
                <Chip
                  label={`Price: ${filters.min_price || '0'} - ${filters.max_price || '...'}`}
                  onDelete={() => {
                    handleFilterChange('min_price', '');
                    handleFilterChange('max_price', '');
                  }}
                />
              )}
            </Box>
          )}

          <Grid container spacing={3}>
            {isLoading
              ? Array.from({ length: 12 }).map((_, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Card sx={{ height: '100%' }}>
                      <Skeleton variant="rectangular" height={200} />
                      <CardContent>
                        <Skeleton variant="text" height={28} />
                        <Skeleton variant="text" width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              : products.length === 0 ? (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No products found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Try adjusting your filters or search query
                      </Typography>
                      <Button onClick={clearFilters}>Clear Filters</Button>
                    </Box>
                  </Grid>
                )
              : products.map((product) => (
                  <Grid item xs={12} sm={6} lg={4} key={product.id}>
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
                        component={RouterLink}
                        to={`/products/${product.id}`}
                        image={product.image || '/placeholder.jpg'}
                        sx={{
                          height: 200,
                          backgroundSize: 'cover',
                        }}
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
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {product.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
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

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.total_pages}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80vh',
          },
        }}
      >
        <FilterPanel />
      </Drawer>
    </Container>
  );
}

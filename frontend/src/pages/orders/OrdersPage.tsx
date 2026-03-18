import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Skeleton,
  Alert,
  Pagination,
} from '@mui/material';
import { Visibility, ShoppingBag } from '@mui/icons-material';
import { ordersApi } from '../../api/orders';
import { Order } from '../../types';

const statusColors: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ordersApi.getMyOrders({ page, page_size: 10 });
        setOrders(response.orders || []);
        setTotalPages(response.pagination?.total_pages || 1);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
          My Orders
        </Typography>
        <Paper>
          {Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Skeleton variant="text" width="30%" />
              <Skeleton variant="text" width="50%" />
            </Box>
          ))}
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 100, color: 'grey.300', mb: 3 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            No Orders Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You haven't placed any orders yet. Start shopping!
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
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
        My Orders
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    #{order.id.slice(0, 8)}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell>
                  {order.items?.length || 0} items
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600} color="primary">
                    {formatPrice(order.total_amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={statusColors[order.status] || 'default'}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Button
                    component={RouterLink}
                    to={`/orders/${order.id}`}
                    size="small"
                    startIcon={<Visibility />}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
}

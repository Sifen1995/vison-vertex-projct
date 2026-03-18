import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ShoppingCart,
  Person,
  Menu as MenuIcon,
  Home,
  Inventory,
  Login,
  PersonAdd,
  Dashboard,
  Receipt,
  Settings,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { CartDrawer } from '../cart/CartDrawer';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/');
  };

  const isAdmin = user?.role === 1;
  const isSeller = user?.is_verified;

  const navItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Products', path: '/products', icon: <Inventory /> },
  ];

  return (
    <>
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'background.paper' }}>
        <Toolbar className="max-w-7xl mx-auto w-full">
          {isMobile && (
            <IconButton
              edge="start"
              color="primary"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              flexGrow: isMobile ? 1 : 0,
              mr: 4,
            }}
          >
            ShopVerse
          </Typography>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  sx={{ color: 'text.primary' }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="primary" onClick={openCart}>
              <Badge badgeContent={totalItems} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {isAuthenticated ? (
              <>
                <IconButton color="primary" onClick={handleMenuOpen}>
                  <Person />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </MenuItem>
                  <Divider />
                  {(isAdmin || isSeller) && (
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate('/admin');
                      }}
                    >
                      <ListItemIcon>
                        <Dashboard fontSize="small" />
                      </ListItemIcon>
                      Dashboard
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate('/orders');
                    }}
                  >
                    <ListItemIcon>
                      <Receipt fontSize="small" />
                    </ListItemIcon>
                    My Orders
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate('/profile');
                    }}
                  >
                    <ListItemIcon>
                      <Settings fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              !isMobile && (
                <>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="small"
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="small"
                  >
                    Sign Up
                  </Button>
                </>
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, pb: 2, fontWeight: 700 }}>
            ShopVerse
          </Typography>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            {!isAuthenticated && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListItem disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ListItemIcon>
                      <Login />
                    </ListItemIcon>
                    <ListItemText primary="Login" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ListItemIcon>
                      <PersonAdd />
                    </ListItemIcon>
                    <ListItemText primary="Sign Up" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      <CartDrawer />
    </>
  );
}

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  EventNote,
  School,
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ✅ Import assets
import logo from '../assets/logo.png';
import background from '../assets/layout-background.jpg'; // your light abstract background

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Students', icon: <People />, path: '/students' },
    { text: 'Attendance', icon: <EventNote />, path: '/attendance' },
    { text: 'Class Attendance', icon: <School />, path: '/class-attendance' },
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <div>
      {/* ✅ Drawer Header with Logo */}
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2,
          backgroundColor: '#fff',
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            height: 40,
            width: 'auto',
          }}
        />
      </Toolbar>

      {/* ✅ Sidebar Menu */}
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              backgroundColor:
                location.pathname === item.path
                  ? 'rgba(25, 118, 210, 0.1)'
                  : 'inherit',
              '&.Mui-selected': {
                color: '#1976d2',
                fontWeight: 'bold',
              },
              '&:hover': {
                backgroundColor: 'rgba(25,118,210,0.05)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? '#1976d2' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* ✅ Top Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#1976d2',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* ✅ Logo + Title in Topbar */}
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <img
              src={logo}
              alt="Logo"
              style={{
                height: 34,
                width: 'auto',
                marginRight: 10,
                borderRadius: 4,
              }}
            />
            <Typography variant="h6" noWrap component="div">
              Student Attendance System
            </Typography>
          </Box>

          {/* ✅ Logout Button */}
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<ExitToApp />}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* ✅ Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Permanent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#fff',
              borderRight: '1px solid #e0e0e0',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* ✅ Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 3,
            p: 3,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            minHeight: '85vh',
            backdropFilter: 'blur(6px)',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

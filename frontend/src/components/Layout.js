import { useState } from "react";
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
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  EventNote,
  School,
  ExitToApp,
  ManageAccounts,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PERMISSIONS } from "../config/permissions";
import logo from "../assets/logo.png";
import background from "../assets/layout-background.jpg";

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ Define all menu items
  const allMenuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
    { text: "Students", icon: <People />, path: "/students" },
    { text: "Attendance", icon: <EventNote />, path: "/attendance" },
    { text: "Class Attendance", icon: <School />, path: "/class-attendance" },
    { text: "User Management", icon: <ManageAccounts />, path: "/user-management" },
  ];

  // ✅ Filter allowed menu items by role or superuser
  const allowedRoutes = user?.is_superuser
    ? allMenuItems.map((item) => item.path)
    : PERMISSIONS[role]?.canAccess || [];

  const visibleMenuItems = allMenuItems.filter((item) =>
    allowedRoutes.includes(item.path)
  );

  // ✅ Drawer content
  const drawer = (
    <div>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 2,
          backgroundColor: "#fff",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <img src={logo} alt="Logo" style={{ height: 40, width: "auto" }} />
      </Toolbar>

      <List>
        {visibleMenuItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              sx={{
                backgroundColor: selected ? "rgba(25,118,210,0.1)" : "inherit",
                "&:hover": { backgroundColor: "rgba(25,118,210,0.08)" },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <ListItemIcon
                sx={{
                  color: selected ? "#1976d2" : "#444",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: selected ? "bold" : 500,
                  color: selected ? "#1976d2" : "#222",
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* ✅ Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "#1976d2",
          boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <Toolbar>
          {/* ☰ Mobile Menu */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* 🧭 App Title */}
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <img
              src={logo}
              alt="Logo"
              style={{
                height: 34,
                width: "auto",
                marginRight: 10,
                borderRadius: 4,
              }}
            />
            <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
              Student Attendance System
            </Typography>
          </Box>

          {/* 👤 User Info + Logout */}
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.username} ({role})
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<ExitToApp />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { color: "#ffebee" },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* ✅ Sidebar */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        {/* 📱 Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid #ddd",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* 💻 Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid #ddd",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* ✅ Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Box
          sx={{
            backgroundColor: "rgba(255,255,255,0.85)",
            borderRadius: 3,
            p: 3,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            backdropFilter: "blur(6px)",
            minHeight: "calc(100vh - 150px)",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

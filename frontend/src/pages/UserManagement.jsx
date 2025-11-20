import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogActions,
  Chip,
} from "@mui/material";
import { Add, Refresh, Edit, Delete } from "@mui/icons-material";
import { fetchUsers, createUser, fetchRoles, api } from "../services/api";
import UserForm from "../components/UserForm"; // ✅ Reusable Add/Edit modal

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // ✅ Fetch users + roles on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userRes, roleRes] = await Promise.all([fetchUsers(), fetchRoles()]);
      setUsers(userRes.data || []);
      setRoles(roleRes.data || []);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add or Edit user
  const handleSaveUser = async (formData) => {
    try {
      if (selectedUser) {
        // Edit user
        await api.put(`/api/users/${selectedUser.id}`, formData);
        alert("✅ User updated successfully!");
      } else {
        // Create new user
        await createUser(formData);
        alert("✅ User created successfully!");
      }
      await loadData();
      setOpenForm(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error saving user:", err);
      alert("❌ Failed to save user.");
    }
  };

  // ✅ Edit user handler
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  // ✅ Delete user handler
  const handleDeleteUser = async () => {
    try {
      await api.delete(`/api/users/${userToDelete.id}`);
      alert("🗑️ User deleted successfully!");
      setConfirmDelete(false);
      setUserToDelete(null);
      await loadData();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("❌ Failed to delete user.");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          👥 User Management
        </Typography>
        <Box>
          <Tooltip title="Reload">
            <IconButton onClick={loadData}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedUser(null);
              setOpenForm(true);
            }}
            sx={{ ml: 2 }}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Paper elevation={3}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>

                    {/* ✅ FIXED Role column */}
                    <TableCell>
                      <Chip
                        label={user.role || "Viewer"}
                        color={
                          user.role === "Admin"
                            ? "primary"
                            : user.role === "Teacher"
                            ? "secondary"
                            : "default"
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>{user.is_active ? "Active" : "Inactive"}</TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleEditUser(user)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => {
                            setUserToDelete(user);
                            setConfirmDelete(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* ✅ Add/Edit User Form */}
      <UserForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={handleSaveUser}
        user={selectedUser}
      />

      {/* ✅ Delete Confirmation */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        maxWidth="xs"
      >
        <DialogTitle>
          Are you sure you want to delete user <b>{userToDelete?.username}</b>?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteUser}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Refresh } from "@mui/icons-material";
import {
  fetchRoles,
  createRole,
  fetchPermissions,
  updatePermissions,
} from "../services/api";
import RolePermissionTable from "../components/RolePermissionTable";

const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "students", label: "Students" },
  { key: "attendance", label: "Attendance" },
  { key: "class-attendance", label: "Class Attendance" },
  { key: "reports", label: "Reports" },
  { key: "users", label: "User Management" },
];

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openPerm, setOpenPerm] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const [form, setForm] = useState({ name: "", description: "" });
  const [permissions, setPermissions] = useState({});

  // ✅ Fetch all roles
  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await fetchRoles();
      setRoles(res.data || []);
    } catch (err) {
      console.error("Error loading roles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // ✅ Handle input changes
  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Add new role
  const handleSaveRole = async () => {
    if (!form.name) return alert("⚠️ Role name is required");
    try {
      await createRole(form);
      alert("✅ Role created successfully!");
      setOpenForm(false);
      setForm({ name: "", description: "" });
      await loadRoles();
    } catch (err) {
      console.error("Error creating role:", err);
      alert("❌ Failed to create role.");
    }
  };

  // ✅ Open permission dialog
  const handleOpenPermissions = async (role) => {
    setSelectedRole(role);
    setOpenPerm(true);
    try {
      const res = await fetchPermissions(role.id);
      const rolePerms = {};
      res.data.forEach((p) => {
        rolePerms[p.module] = {
          can_view: p.can_view,
          can_edit: p.can_edit,
          can_delete: p.can_delete,
        };
      });
      setPermissions(rolePerms);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setPermissions({});
    }
  };

  // ✅ Toggle permission in table
  const handleToggle = (module, field) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [field]: !prev[module]?.[field],
      },
    }));
  };

  // ✅ Save updated permissions
  const handleSavePermissions = async () => {
    const payload = Object.keys(permissions).map((mod) => ({
      module: mod,
      can_view: permissions[mod]?.can_view || false,
      can_edit: permissions[mod]?.can_edit || false,
      can_delete: permissions[mod]?.can_delete || false,
    }));

    try {
      await updatePermissions(selectedRole.id, payload);
      alert("✅ Permissions updated successfully!");
      setOpenPerm(false);
      setPermissions({});
    } catch (err) {
      console.error("Error updating permissions:", err);
      alert("❌ Failed to update permissions.");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          🧩 Role Management
        </Typography>
        <Box>
          <Tooltip title="Reload">
            <IconButton onClick={loadRoles}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenForm(true)}
            sx={{ ml: 2 }}
          >
            Add Role
          </Button>
        </Box>
      </Box>

      {/* Roles Table */}
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
                <TableCell>Role Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No roles found.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.description || "—"}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Permissions">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenPermissions(r)}
                        >
                          <Edit />
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

      {/* ✅ Add Role Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Role</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="normal"
            fullWidth
            label="Role Name"
            name="name"
            value={form.name}
            onChange={handleInput}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Description"
            name="description"
            value={form.description}
            onChange={handleInput}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRole}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Manage Permissions Dialog */}
      <Dialog open={openPerm} onClose={() => setOpenPerm(false)} fullWidth maxWidth="md">
        <DialogTitle>
          Manage Permissions — {selectedRole?.name}
        </DialogTitle>
        <DialogContent dividers>
          <RolePermissionTable
            modules={MODULES}
            permissions={permissions}
            onToggle={handleToggle}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPerm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePermissions}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;

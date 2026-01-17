import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Add, Refresh, Edit } from "@mui/icons-material";
import { fetchGroups, createGroup, fetchGroupPermissions, updateGroupPermissions } from "../services/api";
import RolePermissionTable from "../components/RolePermissionTable";

const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "students", label: "Students" },
  { key: "attendance", label: "Attendance" },
  { key: "class-attendance", label: "Class Attendance" },
  { key: "reports", label: "Reports" },
  { key: "users", label: "User Management" },
];

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openPerm, setOpenPerm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [permissions, setPermissions] = useState({});

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await fetchGroups();
      setGroups(res.data || []);
    } catch (err) {
      console.error("Error loading groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveGroup = async () => {
    if (!form.name) return alert("⚠️ Group name is required");
    try {
      await createGroup(form);
      alert("✅ Group created successfully!");
      setOpenForm(false);
      setForm({ name: "", description: "" });
      await loadGroups();
    } catch (err) {
      console.error("Error creating group:", err);
      alert("❌ Failed to create group.");
    }
  };

  const handleOpenPermissions = async (group) => {
    setSelectedGroup(group);
    setOpenPerm(true);
    try {
      const res = await fetchGroupPermissions(group.id);
      const perms = {};
      res.data.forEach((p) => {
        perms[p.module] = { can_view: p.can_view, can_edit: p.can_edit, can_delete: p.can_delete };
      });
      setPermissions(perms);
    } catch (err) {
      console.error("Error fetching group permissions:", err);
      setPermissions({});
    }
  };

  const handleToggle = (module, field) => {
    setPermissions((prev) => ({ ...prev, [module]: { ...prev[module], [field]: !prev[module]?.[field] } }));
  };

  const handleSavePermissions = async () => {
    const payload = Object.keys(permissions).map((mod) => ({
      module: mod,
      can_view: permissions[mod]?.can_view || false,
      can_edit: permissions[mod]?.can_edit || false,
      can_delete: permissions[mod]?.can_delete || false,
    }));

    try {
      await updateGroupPermissions(selectedGroup.id, payload);
      alert("✅ Group permissions updated!");
      setOpenPerm(false);
      setPermissions({});
    } catch (err) {
      console.error("Error updating group permissions:", err);
      alert("❌ Failed to update permissions.");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">🧩 Group Management</Typography>
        <Box>
          <Tooltip title="Reload">
            <IconButton onClick={loadGroups}><Refresh /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenForm(true)} sx={{ ml: 2 }}>Add Group</Button>
        </Box>
      </Box>

      <Paper elevation={3}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Members</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No groups found.</TableCell></TableRow>
              ) : (
                groups.map((g, i) => (
                  <TableRow key={g.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{g.name}</TableCell>
                    <TableCell>{g.description || '—'}</TableCell>
                    <TableCell>{(g.users || []).map(u => u.username).join(', ')}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Permissions">
                        <IconButton color="primary" onClick={() => handleOpenPermissions(g)}><Edit /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Add Group Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Group</DialogTitle>
        <DialogContent dividers>
          <TextField margin="normal" fullWidth label="Group Name" name="name" value={form.name} onChange={handleInput} />
          <TextField margin="normal" fullWidth label="Description" name="description" value={form.description} onChange={handleInput} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveGroup}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={openPerm} onClose={() => setOpenPerm(false)} fullWidth maxWidth="md">
        <DialogTitle>Manage Group Permissions — {selectedGroup?.name}</DialogTitle>
        <DialogContent dividers>
          <RolePermissionTable modules={MODULES} permissions={permissions} onToggle={handleToggle} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPerm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePermissions}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupManagement;

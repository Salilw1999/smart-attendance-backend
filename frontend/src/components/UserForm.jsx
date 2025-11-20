import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { fetchRoles } from "../services/api";

/**
 * ✅ UserForm Component
 * Reusable modal for adding/editing users.
 *
 * Props:
 *  - open: boolean → controls visibility
 *  - onClose: function → called when modal closes
 *  - onSave: function(data) → called with form data on submit
 *  - user: object → (optional) user data when editing
 */
const UserForm = ({ open, onClose, onSave, user }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role_id: "",
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch roles from backend when modal opens
  useEffect(() => {
    if (open) loadRoles();
  }, [open]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await fetchRoles();
      setRoles(res.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Pre-fill user data when editing
  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        email: user.email || "",
        password: "",
        role_id: user.role_id || "",
      });
    } else {
      setForm({
        username: "",
        email: "",
        password: "",
        role_id: "",
      });
    }
  }, [user]);

  // ✅ Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Form submit handler
  const handleSubmit = async () => {
    if (!form.username || (!user && !form.password) || !form.role_id) {
      alert("⚠️ Please fill all required fields: Username, Password, Role");
      return;
    }

    try {
      setSaving(true);
      await onSave(form);
      onClose();
    } catch (err) {
      console.error("Error saving user:", err);
      alert("❌ Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {user ? "✏️ Edit User" : "➕ Add New User"}
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Username */}
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />

            {/* Email */}
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
            />

            {/* Password */}
            {!user && (
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            )}

            {/* Role Dropdown */}
            <TextField
              fullWidth
              select
              margin="normal"
              label="Role"
              name="role_id"
              value={form.role_id}
              onChange={handleChange}
              required
            >
              {roles.length > 0 ? (
                roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Loading roles...</MenuItem>
              )}
            </TextField>

            {roles.length === 0 && !loading && (
              <Typography variant="body2" color="textSecondary" mt={1}>
                ⚠️ No roles found. Please create roles in the Roles section.
              </Typography>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          disabled={saving || loading}
          onClick={handleSubmit}
        >
          {saving ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;

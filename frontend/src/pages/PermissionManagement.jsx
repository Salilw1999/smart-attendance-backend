import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Button,
  CircularProgress,
  Paper,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Save, ArrowBack } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPermissions, updatePermissions } from "../services/api";

// ✅ Define which modules exist in your system
const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "students", label: "Students" },
  { key: "attendance", label: "Attendance" },
  { key: "class_attendance", label: "Class Attendance" },
  { key: "reports", label: "Reports" },
  { key: "users", label: "User Management" },
  { key: "roles", label: "Role Management" },
];

const PermissionManagement = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();

  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch current permissions for this role
  useEffect(() => {
    const loadPermissions = async () => {
      setLoading(true);
      try {
        const res = await fetchPermissions(roleId);
        const permData = {};

        // Convert list → object { module: { can_view, can_edit, can_delete } }
        (res.data || []).forEach((p) => {
          permData[p.module] = {
            can_view: p.can_view,
            can_edit: p.can_edit,
            can_delete: p.can_delete,
          };
        });

        // Initialize missing modules
        MODULES.forEach((mod) => {
          if (!permData[mod.key]) {
            permData[mod.key] = {
              can_view: false,
              can_edit: false,
              can_delete: false,
            };
          }
        });

        setPermissions(permData);
      } catch (err) {
        console.error("❌ Error fetching permissions:", err);
        alert("Failed to load permissions");
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [roleId]);

  // ✅ Toggle checkbox for a module and permission type
  const handleToggle = (module, field) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [field]: !prev[module][field],
      },
    }));
  };

  // ✅ Save updated permissions
  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert object → list
      const payload = Object.entries(permissions).map(([module, rights]) => ({
        module,
        ...rights,
      }));

      await updatePermissions(roleId, payload);
      alert("✅ Permissions updated successfully!");
    } catch (err) {
      console.error("Error saving permissions:", err);
      alert("❌ Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Render Loading Spinner
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header Section */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold">
          🔐 Manage Permissions — Role ID: {roleId}
        </Typography>
        <Box>
          <Tooltip title="Go Back">
            <IconButton onClick={() => navigate("/roles")}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
            sx={{ ml: 2 }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Box>

      {/* Permission Table */}
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Module</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                View
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Edit
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Delete
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {MODULES.map((mod) => (
              <TableRow key={mod.key}>
                <TableCell>{mod.label}</TableCell>

                {["can_view", "can_edit", "can_delete"].map((field) => (
                  <TableCell key={field} align="center">
                    <Checkbox
                      checked={permissions[mod.key]?.[field] || false}
                      onChange={() => handleToggle(mod.key, field)}
                      color="primary"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default PermissionManagement;

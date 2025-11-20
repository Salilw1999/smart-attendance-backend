import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Paper,
  Typography,
  Box,
} from "@mui/material";

/**
 * ✅ RolePermissionTable Component
 * Reusable permission editor table.
 * 
 * Props:
 *  - modules: Array of module definitions [{ key, label }]
 *  - permissions: Object of current permission states
 *      e.g. { students: { can_view: true, can_edit: false, can_delete: true } }
 *  - onToggle: Function(moduleKey, permissionField) to toggle checkbox
 */
const RolePermissionTable = ({ modules, permissions, onToggle }) => {
  if (!modules || modules.length === 0) {
    return (
      <Box p={2}>
        <Typography color="textSecondary" align="center">
          No modules defined.
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Module</TableCell>
            <TableCell align="center">View</TableCell>
            <TableCell align="center">Edit</TableCell>
            <TableCell align="center">Delete</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {modules.map((mod) => (
            <TableRow key={mod.key}>
              <TableCell>{mod.label}</TableCell>
              {["can_view", "can_edit", "can_delete"].map((field) => (
                <TableCell key={field} align="center">
                  <Checkbox
                    color="primary"
                    checked={permissions?.[mod.key]?.[field] || false}
                    onChange={() => onToggle(mod.key, field)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default RolePermissionTable;

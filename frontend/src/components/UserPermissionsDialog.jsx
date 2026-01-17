import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";
import { fetchRoles, fetchGroups, addUsersToGroup, removeUserFromGroup } from "../services/api";
import { api } from "../services/api";

const UserPermissionsDialog = ({ open, onClose, user, onSaved }) => {
  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(user?.role_id || "");
  const [memberOf, setMemberOf] = useState(new Set());

  useEffect(() => {
    if (!open) return;
    // call here to avoid adding loadData as dependency
    (async () => {
      setLoading(true);
      try {
        const [rRes, gRes] = await Promise.all([fetchRoles(), fetchGroups()]);
        // Deduplicate roles case-insensitively and normalize display name to Title Case
        const rawRoles = rRes.data || [];
        const titleCase = (s) =>
          (s || "")
            .toString()
            .toLowerCase()
            .replace(/(^|\s)\S/g, (t) => t.toUpperCase());

        const roleMap = new Map();
        for (const r of rawRoles) {
          const key = (r.name || "").toString().toLowerCase();
          if (!roleMap.has(key)) {
            roleMap.set(key, { id: r.id, name: titleCase(r.name) });
          } else {
            // prefer the role id that matches the user's current role if present
            if (user && user.role_id === r.id) {
              roleMap.set(key, { id: r.id, name: titleCase(r.name) });
            }
          }
        }

        const rList = Array.from(roleMap.values());

        // If the user's current role_id was removed from roles list, add a fallback option
        if (user && user.role_id) {
          const hasUserRole = rList.some((rr) => rr.id === user.role_id);
          if (!hasUserRole) {
            rList.unshift({ id: user.role_id, name: "(Removed role)" });
          }
        }

        setRoles(rList);
        const gList = gRes.data || [];
        setGroups(gList);

        // mark groups the user is currently a member of by inspecting each group's users
        const userGroupIds = new Set();
        gList.forEach((g) => {
          if (Array.isArray(g.users)) {
            g.users.forEach((u) => {
              if (u.id === user?.id) userGroupIds.add(g.id);
            });
          }
        });
        setMemberOf(userGroupIds);
      } catch (err) {
        console.error("Error loading roles/groups", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, user]);

  useEffect(() => {
    setSelectedRoleId(user?.role_id ? String(user.role_id) : "");
  }, [user]);

  // loadData removed — logic is in useEffect to avoid stale dependencies

  const toggleGroup = (groupId) => {
    setMemberOf((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
  // 1) update role via users API (ensure numeric id or null)
  await api.put(`/api/users/${user.id}`, { role_id: selectedRoleId ? Number(selectedRoleId) : null });

      // 2) sync group membership: add where missing, remove where unchecked
      const currentGroupIds = new Set((user?.groups || []).map((g) => g.id));
      const target = memberOf;

      // add
      for (const gid of target) {
        if (!currentGroupIds.has(gid)) {
          await addUsersToGroup(gid, [user.id]);
        }
      }

      // remove
      for (const gid of currentGroupIds) {
        if (!target.has(gid)) {
          await removeUserFromGroup(gid, user.id);
        }
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving user permissions", err);
      alert("Failed to save permissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Manage Permissions — {user?.username}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle1" gutterBottom>Role</Typography>
            <TextField
              select
              SelectProps={{ native: true }}
              value={selectedRoleId || ""}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              fullWidth
            >
              <option value="">(No role)</option>
              {roles.map((r) => (
                <option key={r.id} value={String(r.id)}>{r.name}</option>
              ))}
            </TextField>

            <Box mt={2}>
              <Typography variant="subtitle1" gutterBottom>Groups (group membership grants permissions)</Typography>
              {groups.length === 0 ? (
                <Typography variant="body2">No groups available.</Typography>
              ) : (
                groups.map((g) => (
                  <FormControlLabel
                    key={g.id}
                    control={<Checkbox checked={memberOf.has(g.id)} onChange={() => toggleGroup(g.id)} />}
                    label={`${g.name} ${(g.users || []).length ? `(${g.users.length})` : ""}`}
                  />
                ))
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserPermissionsDialog;

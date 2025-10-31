import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TablePagination, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Avatar,
  Snackbar, Alert, CircularProgress
} from "@mui/material";
import { api } from "../services/api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [classroomOptions, setClassroomOptions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

  const emptyForm = {
    name: "",
    unique_number: "",
    class_name: "",
    classroom_name: "",
    parent_contact: "",
    parent_email: "",
    contact_number: "",
    blood_group: "",
    photo_url: ""
  };

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    loadStudents();
    loadClassesAndRooms();
  }, []);

  // 🔹 Fetch classes & classrooms
  const loadClassesAndRooms = async () => {
    try {
      const [classRes, roomRes] = await Promise.all([
        api.get("/api/classes"),
        api.get("/api/classrooms"),
      ]);
      setClassOptions(classRes.data);
      setClassroomOptions(roomRes.data);
    } catch (err) {
      console.error("Error loading class/classroom data:", err);
      showSnack("Failed to load class data", "error");
    }
  };

  // 🔹 Fetch all students
  const loadStudents = async () => {
    try {
      const res = await api.get("/api/students/");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("loadStudents:", err);
      showSnack("Failed to load students", "error");
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setPreviewUrl("");
    setOpen(true);
  };

  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name || "",
      unique_number: s.unique_number || "",
      class_name: s.class_name || "",
      classroom_name: s.classroom_name || "",
      parent_contact: s.parent_contact || "",
      parent_email: s.parent_email || "",
      contact_number: s.contact_number || "",
      blood_group: s.blood_group || "",
      photo_url: s.photo_url || ""
    });
    setSelectedFile(null);
    setPreviewUrl(s.photo_url || "");
    setOpen(true);
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setSelectedFile(f || null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(form.photo_url || "");
    }
  };

  // 🔹 Save or update student
  const handleSave = async () => {
    if (!form.name.trim() || !form.unique_number.trim()) {
      showSnack("Name and Unique Number are required", "warning");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("unique_number", form.unique_number);
      if (form.class_name) fd.append("class_name", form.class_name);
      if (form.classroom_name) fd.append("classroom_name", form.classroom_name);
      if (form.parent_contact) fd.append("parent_contact", form.parent_contact);
      if (form.parent_email) fd.append("parent_email", form.parent_email);
      if (form.contact_number) fd.append("contact_number", form.contact_number);
      if (form.blood_group) fd.append("blood_group", form.blood_group);
      if (selectedFile) fd.append("photo", selectedFile, selectedFile.name);

      if (editingId) {
        await api.put(`/api/students/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showSnack("Student updated", "success");
      } else {
        await api.post("/api/students", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showSnack("Student created", "success");
      }

      setOpen(false);
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      await loadStudents();
    } catch (err) {
      console.error("save error:", err);
      const msg = err?.response?.data?.detail || "Failed to save student";
      showSnack(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Delete student
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await api.delete(`/api/students/${id}`);
      showSnack("Deleted successfully", "success");
      await loadStudents();
    } catch (err) {
      console.error(err);
      showSnack("Failed to delete", "error");
    }
  };

  const showSnack = (message, severity = "info") =>
    setSnack({ open: true, message, severity });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Students</Typography>
        <Button variant="contained" onClick={openAdd}>
          Add Student
        </Button>
      </Box>

      {/* 🔹 Student List */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Unique No</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Classroom</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                students
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        {s.photo_url ? (
                          <Avatar
                            src={s.photo_url}
                            alt={s.name}
                            sx={{ width: 48, height: 48 }}
                          />
                        ) : (
                          <Avatar sx={{ width: 48, height: 48 }}>
                            {s.name ? s.name.charAt(0) : "?"}
                          </Avatar>
                        )}
                      </TableCell>
                      <TableCell>{s.unique_number ?? "-"}</TableCell>
                      <TableCell>{s.name ?? "-"}</TableCell>
                      <TableCell>{s.class_name ?? "-"}</TableCell>
                      <TableCell>{s.classroom_name ?? "-"}</TableCell>
                      <TableCell>{s.contact_number ?? "-"}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => openEdit(s)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDelete(s.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={students.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* 🔹 Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Student" : "Add Student"}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Unique Number"
              value={form.unique_number}
              onChange={(e) => setForm({ ...form, unique_number: e.target.value })}
              required
            />
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <TextField
              select
              label="Class"
              value={form.class_name || ""}
              onChange={(e) => setForm({ ...form, class_name: e.target.value })}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {classOptions.map((c) => (
                <MenuItem key={c.id} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Classroom"
              value={form.classroom_name || ""}
              onChange={(e) => setForm({ ...form, classroom_name: e.target.value })}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {classroomOptions.map((r) => (
                <MenuItem key={r.id} value={r.name}>
                  {r.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Parent Contact"
              value={form.parent_contact || ""}
              onChange={(e) => setForm({ ...form, parent_contact: e.target.value })}
            />
            <TextField
              label="Contact Number"
              value={form.contact_number || ""}
              onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
            />
            <TextField
              label="Parent Email"
              type="email"
              value={form.parent_email || ""}
              onChange={(e) => setForm({ ...form, parent_email: e.target.value })}
            />
            <TextField
              label="Blood Group"
              value={form.blood_group || ""}
              onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
            />

            <Box
              sx={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: 2,
                alignItems: "center",
              }}
            >
              <input
                accept="image/*"
                id="student-photo"
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <label htmlFor="student-photo">
                <Button variant="outlined" component="span">
                  Choose Photo
                </Button>
              </label>

              {previewUrl ? (
                <Avatar src={previewUrl} sx={{ width: 64, height: 64 }} />
              ) : (
                <Avatar sx={{ width: 64, height: 64 }}>
                  {form.name ? form.name.charAt(0) : "?"}
                </Avatar>
              )}

              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">
                  Selected: {selectedFile ? selectedFile.name : "No file"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            color="primary"
          >
            {saving ? <CircularProgress size={20} /> : editingId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { api } from "../services/api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    unique_number: "",
    classroom: "",
    parent_contact: "",
    parent_email: "",
    contact_number: "",
    blood_group: "",
  });

  // ✅ Load data on page load
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await fetchStudents();
      setStudents(data);
    } catch (err) {
      console.error("Error loading students:", err);
    }
  };

  const handleSave = async () => {
    try {
      // ✅ Step 1: Save student to DB
      const savedStudent = await createStudent(formData);

      // ✅ Step 2: Upload Photo if selected
      if (imageFile) {
        const imgData = new FormData();
        imgData.append("file", imageFile);
        imgData.append("student_id", savedStudent.id); // ✅ backend expects this ID
        await uploadPhoto(imgData);
      }

      setOpen(false);
      loadStudents();
    } catch (err) {
      console.error("Error saving student:", err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Students</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add New Student
        </Button>
      </Box>

      {/* STUDENTS TABLE */}
      <Paper>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Unique Number</TableCell>
                <TableCell>Classroom</TableCell>
                <TableCell>Contact</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {students.length > 0 ? (
                students
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((st) => (
                    <TableRow key={st.id}>
                      <TableCell>{st?.id}</TableCell>
                      <TableCell>{st?.name || "-"}</TableCell>
                      <TableCell>{st?.unique_number || "-"}</TableCell>
                      <TableCell>{st?.classroom || st?.class_name || "-"}</TableCell>
                      <TableCell>{st?.contact_number || "-"}</TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No Students Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
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

      {/* ✅ ADD STUDENT FORM */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Add Student</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Unique Number"
            value={formData.unique_number}
            onChange={(e) =>
              setFormData({ ...formData, unique_number: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Classroom"
            value={formData.classroom}
            onChange={(e) =>
              setFormData({ ...formData, classroom: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Parent Contact"
            value={formData.parent_contact}
            onChange={(e) =>
              setFormData({ ...formData, parent_contact: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Contact Number"
            value={formData.contact_number}
            onChange={(e) =>
              setFormData({ ...formData, contact_number: e.target.value })
            }
            fullWidth
          />

          {/* ✅ Upload Photo */}
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Student
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

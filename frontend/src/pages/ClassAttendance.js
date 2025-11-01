import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Paper,
  TableContainer,
} from "@mui/material";
import { api } from "../services/api";

export default function ClassAttendance() {
  const [classList, setClassList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Load all classes and classrooms on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, roomRes] = await Promise.all([
          api.get("/api/classes"),
          api.get("/api/classrooms"),
        ]);
        setClassList(classRes.data);
        setRoomList(roomRes.data);
      } catch (err) {
        console.error("Error loading classes or classrooms:", err);
      }
    };
    fetchData();
  }, []);

  // ✅ Load students automatically when class or classroom changes
  useEffect(() => {
    const fetchStudents = async () => {
      // if neither filter selected, skip
      if (!selectedClass && !selectedRoom) {
        setStudents([]);
        return;
      }

      setLoading(true);
      try {
        // Build query params dynamically
        const params = [];
        if (selectedClass) params.push(`class_id=${selectedClass}`);
        if (selectedRoom) params.push(`classroom_id=${selectedRoom}`);
        const query = params.length ? `?${params.join("&")}` : "";

        const res = await api.get(`/attendance/manual/students${query}`);

        if (res.data.message || !res.data.length) {
          setStudents([]);
        } else {
          setStudents(res.data);
          // initialize default attendance
          const init = {};
          res.data.forEach((s) => (init[s.id] = "Present"));
          setAttendance(init);
        }
      } catch (err) {
        console.error("Error loading students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedRoom]); // 👈 re-fetch whenever these change

  // ✅ Change attendance status
  const handleStatusChange = (id, status) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  // ✅ Save attendance
  const handleSave = async () => {
    if (!students.length) return;
    setSaving(true);
    try {
      for (const s of students) {
        await api.post("/attendance/manual", {
          student_id: s.id,
          status: attendance[s.id],
        });
      }
      alert("✅ Attendance saved successfully!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("❌ Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        📘 Manual Attendance
      </Typography>

      {/* Filters */}
      <Box display="flex" gap={2} mb={3}>
        {/* Class Dropdown */}
        <FormControl fullWidth>
          <InputLabel>Class</InputLabel>
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <MenuItem value="">All Classes</MenuItem>
            {classList.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Classroom Dropdown */}
        <FormControl fullWidth>
          <InputLabel>Classroom</InputLabel>
          <Select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
          >
            <MenuItem value="">All Classrooms</MenuItem>
            {roomList.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Students Table */}
      {loading ? (
        <CircularProgress />
      ) : students.length > 0 ? (
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Unique Number</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Classroom</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.unique_number}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.class_name}</TableCell>
                    <TableCell>{s.classroom_name}</TableCell>
                    <TableCell>
                      <Select
                        value={attendance[s.id] || "Present"}
                        onChange={(e) =>
                          handleStatusChange(s.id, e.target.value)
                        }
                      >
                        <MenuItem value="Present">Present</MenuItem>
                        <MenuItem value="Absent">Absent</MenuItem>
                        <MenuItem value="Late">Late</MenuItem>
                        <MenuItem value="Half Day">Half Day</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            sx={{ mt: 2 }}
            variant="contained"
            color="success"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : "Save Attendance"}
          </Button>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          No students found for the selected filters.
        </Alert>
      )}
    </Box>
  );
}

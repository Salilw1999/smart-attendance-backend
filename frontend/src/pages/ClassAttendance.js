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

  // ✅ Load all classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/api/classes"); // <-- updated endpoint
        setClassList(res.data);
      } catch (err) {
        console.error("Error loading classes:", err);
      }
    };
    fetchClasses();
  }, []);

  // ✅ When a class is selected → load classrooms for that class
  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    setSelectedRoom("");
    setStudents([]);

    try {
      const res = await api.get(`/api/classrooms?class_id=${classId}`); // <-- updated endpoint
      setRoomList(res.data);
    } catch (err) {
      console.error("Error loading classrooms:", err);
    }
  };

  // ✅ Load students for selected class + classroom
  const handleLoadStudents = async () => {
    if (!selectedClass || !selectedRoom) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/api/students?class_id=${selectedClass}&classroom_id=${selectedRoom}` // <-- updated endpoint
      );
      setStudents(res.data);

      // Default everyone as "Present"
      const init = {};
      res.data.forEach((s) => (init[s.id] = "Present"));
      setAttendance(init);
    } catch (err) {
      console.error("Error loading students:", err);
    }
    setLoading(false);
  };

  // ✅ Change attendance status for a student
  const handleStatusChange = (id, status) => {
    setAttendance({ ...attendance, [id]: status });
  };

  // ✅ Save attendance
  const handleSave = async () => {
    if (!students.length) return;
    setSaving(true);
    try {
      const records = students.map((s) => ({
        student_id: s.id,
        status: attendance[s.id],
      }));

      await api.post("/api/attendance", {
        records,
        class_id: selectedClass,
        classroom_id: selectedRoom,
      });

      alert("✅ Attendance saved successfully!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("❌ Failed to save attendance");
    }
    setSaving(false);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        📘 Class Attendance
      </Typography>

      {/* Selection Controls */}
      <Box display="flex" gap={2} mb={3}>
        {/* Class Dropdown */}
        <FormControl fullWidth>
          <InputLabel>Class</InputLabel>
          <Select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
          >
            {classList.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name} {/* <-- updated label field */}
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
            disabled={!selectedClass}
          >
            {roomList.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name} {/* <-- updated label field */}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Load Students Button */}
        <Button
          variant="contained"
          onClick={handleLoadStudents}
          disabled={!selectedClass || !selectedRoom || loading}
        >
          {loading ? <CircularProgress size={20} /> : "Load Students"}
        </Button>
      </Box>

      {/* Students Table */}
      {students.length > 0 ? (
        <Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Unique Number</TableCell> {/* <-- updated label */}
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.unique_number}</TableCell> {/* <-- updated field */}
                  <TableCell>{s.name}</TableCell>
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

          {/* Save Button */}
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
        <Alert severity="info">No students loaded yet.</Alert>
      )}
    </Box>
  );
}

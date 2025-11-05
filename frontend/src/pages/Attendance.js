import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { api } from "../services/api";
import { ExportButtons } from "../components/ExportButtons";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [filters, setFilters] = useState({
    class_id: "",
    classroom_id: "",
    start_date: "",
    end_date: "",
    search: "",
  });
  const [classNames, setClassNames] = useState([]);
  const [classroomNames, setClassroomNames] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stats
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ Initial load
  useEffect(() => {
    fetchClassNames();
    fetchClassroomNames();
    fetchAttendance();
  }, []);

  // ✅ Auto-refresh when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttendance(filters);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  // ✅ Fetch attendance records
  const fetchAttendance = async (customFilters = {}) => {
    try {
      setLoading(true);
      const f = { ...filters, ...customFilters };
      const params = {};

      if (f.class_id) params.class_id = f.class_id;
      if (f.classroom_id) params.classroom_id = f.classroom_id;

      // ✅ Use YYYY-MM-DD format (NOT ISO) for proper filtering
      if (f.start_date) params.start_date = f.start_date;
      if (f.end_date) params.end_date = f.end_date;

      const response = await api.get("/api/attendance/records", { params });
      let data = response.data || [];

      // ✅ Frontend student name search
      if (f.search) {
        const term = f.search.toLowerCase();
        data = data.filter((rec) =>
          rec.student_name?.toLowerCase().includes(term)
        );
      }

      setAttendance(data);
      setFilteredAttendance(data);
      setPage(0);

      // ✅ Count stats
      const present = data.filter(
        (r) => r.status?.toLowerCase() === "present"
      ).length;
      const absent = data.filter(
        (r) => r.status?.toLowerCase() === "absent"
      ).length;
      setPresentCount(present);
      setAbsentCount(absent);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch class & classroom lists
  const fetchClassNames = async () => {
    try {
      const res = await api.get("/api/classes/");
      setClassNames(res.data);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const fetchClassroomNames = async () => {
    try {
      const res = await api.get("/api/classrooms/");
      setClassroomNames(res.data);
    } catch (err) {
      console.error("Error fetching classrooms:", err);
    }
  };

  // ✅ Handle input changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleClearFilters = () => {
    setFilters({
      class_id: "",
      classroom_id: "",
      start_date: "",
      end_date: "",
      search: "",
    });
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
        Attendance Records
      </Typography>

      {/* ✅ Summary Stats */}
      <Box
        sx={{
          display: "flex",
          gap: 4,
          mb: 3,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="body1">
          Total Records: <b>{filteredAttendance.length}</b>
        </Typography>
        <Typography variant="body1" color="green">
          Present Count: <b>{presentCount}</b>
        </Typography>
        <Typography variant="body1" color="red">
          Absent Count: <b>{absentCount}</b>
        </Typography>
      </Box>

      {/* ✅ Filters */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          mb: 2,
        }}
      >
        <TextField
          select
          label="Class"
          name="class_id"
          value={filters.class_id}
          onChange={handleFilterChange}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {classNames.map((cls) => (
            <MenuItem key={cls.id} value={cls.id}>
              {cls.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Classroom"
          name="classroom_id"
          value={filters.classroom_id}
          onChange={handleFilterChange}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {classroomNames.map((room) => (
            <MenuItem key={room.id} value={room.id}>
              {room.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Start Date"
          type="date"
          name="start_date"
          value={filters.start_date}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="End Date"
          type="date"
          name="end_date"
          value={filters.end_date}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />

        {/* 🔍 Search */}
        <TextField
          label="Search by Student"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          sx={{ minWidth: 250 }}
        />

        <Button variant="outlined" color="secondary" onClick={handleClearFilters}>
          Clear
        </Button>
      </Box>

      {/* ✅ Export Buttons */}
      <ExportButtons data={filteredAttendance} fileName="attendance_records" />

      {/* ✅ Attendance Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Classroom</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Confidence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAttendance.length > 0 ? (
                  filteredAttendance
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>{record.student_name || "-"}</TableCell>
                        <TableCell>{record.class_name || "-"}</TableCell>
                        <TableCell>{record.classroom_name || "-"}</TableCell>
                        <TableCell>
                          {record.date
                            ? new Date(record.date).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            color:
                              record.status?.toLowerCase() === "present"
                                ? "green"
                                : record.status?.toLowerCase() === "absent"
                                ? "red"
                                : "orange",
                            fontWeight: "bold",
                          }}
                        >
                          {record.status || "-"}
                        </TableCell>
                        <TableCell>
                          {record.confidence_score
                            ? `${record.confidence_score.toFixed(2)}%`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No records found for selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredAttendance.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Container>
  );
};

export default Attendance;

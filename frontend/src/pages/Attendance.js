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
} from "@mui/material";
import { api } from "../services/api";
import { ExportButtons } from "../components/ExportButtons";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [filters, setFilters] = useState({
    class_name: "",
    classroom_name: "",
    start_date: "",
    end_date: "",
  });
  const [classNames, setClassNames] = useState([]);
  const [classroomNames, setClassroomNames] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ Fetch all data on mount
  useEffect(() => {
    fetchAttendance();
    fetchClassNames();
    fetchClassroomNames();
  }, []);

  // ✅ Auto-refresh attendance whenever filters change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAttendance(filters);
    }, 400); // small debounce to avoid excessive API calls
    return () => clearTimeout(timeout);
  }, [filters]);

  const fetchAttendance = async (customFilters = {}) => {
    try {
      setLoading(true);
      const params = {};
      const f = { ...filters, ...customFilters };

      if (f.class_name) params.class_name = f.class_name;
      if (f.classroom_name) params.classroom_name = f.classroom_name;
      if (f.start_date) params.start_date = f.start_date;
      if (f.end_date) params.end_date = f.end_date;

      const response = await api.get("/api/attendance/records", { params });
      setAttendance(response.data);
      setFilteredAttendance(response.data);
      setPage(0);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassNames = async () => {
    try {
      const response = await api.get("/api/classes/");
      setClassNames(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchClassroomNames = async () => {
    try {
      const response = await api.get("/api/classrooms/");
      setClassroomNames(response.data);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    }
  };

  // ✅ Auto-triggered when user changes any filter
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // ✅ Clear Filters
  const handleClearFilters = () => {
    setFilters({
      class_name: "",
      classroom_name: "",
      start_date: "",
      end_date: "",
    });
  };

  // Pagination controls
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

      {/* Filters */}
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
          name="class_name"
          value={filters.class_name}
          onChange={handleFilterChange}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {classNames.map((cls) => (
            <MenuItem key={cls.id} value={cls.name}>
              {cls.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Classroom"
          name="classroom_name"
          value={filters.classroom_name}
          onChange={handleFilterChange}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {classroomNames.map((room) => (
            <MenuItem key={room.id} value={room.name}>
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

        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClearFilters}
        >
          Clear
        </Button>
      </Box>

      {/* Export Buttons */}
      <ExportButtons data={filteredAttendance} fileName="attendance_records" />

      {/* Attendance Table */}
      {loading ? (
        <Typography align="center" sx={{ mt: 4 }}>
          Loading attendance records...
        </Typography>
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
                        <TableCell>{record.student_name}</TableCell>
                        <TableCell>{record.class_name}</TableCell>
                        <TableCell>{record.classroom_name}</TableCell>
                        <TableCell>{record.timestamp}</TableCell>
                        <TableCell>{record.status}</TableCell>
                        <TableCell>
                          {record.confidence
                            ? `${record.confidence.toFixed(2)}%`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No records found
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

import React, { useState, useEffect } from "react";
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
  TablePagination,
  Chip,
  Button,
  Stack,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { api } from "../services/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [classNames, setClassNames] = useState([]);
  const [classroomNames, setClassroomNames] = useState([]);
  const [filters, setFilters] = useState({
    class_name: "",
    classroom_name: "",
    start_date: "",
    end_date: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchAttendance();
    fetchClassNames();
    fetchClassroomNames();
  }, []);

  useEffect(() => {
    // ✅ Apply search filtering locally (by student name)
    const filtered = attendance.filter((record) =>
      record.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAttendance(filtered);
  }, [searchTerm, attendance]);

  const fetchClassNames = async () => {
    try {
      const response = await api.get("/api/classes/");
      const names = response.data.map((cls) => cls.name);
      setClassNames(names);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchClassroomNames = async () => {
    try {
      const response = await api.get("/api/classrooms/");
      const names = response.data.map((room) => room.name);
      setClassroomNames(names);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await api.get("/api/attendance/", {
        params: {
          class_name: filters.class_name || undefined,
          classroom_name: filters.classroom_name || undefined,
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined,
        },
      });
      setAttendance(response.data);
      setFilteredAttendance(response.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleFilterSubmit = () => fetchAttendance();

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ✅ Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredAttendance);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "attendance_records.xlsx");
  };

  // ✅ Export to CSV
  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(filteredAttendance);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "attendance_records.csv");
  };

  // ✅ Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Records", 14, 15);
    const tableColumn = [
      "Student Name",
      "Class",
      "Classroom",
      "Date",
      "Status",
      "Confidence Score",
    ];
    const tableRows = [];

    filteredAttendance.forEach((record) => {
      const rowData = [
        record.student_name || "-",
        record.class_name || "-",
        record.classroom_name || "-",
        formatDate(record.date),
        record.status,
        record.confidence_score?.toFixed(2) || "-",
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("attendance_records.pdf");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Records
      </Typography>

      {/* ✅ Filters Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            label="Class"
            name="class_name"
            value={filters.class_name}
            onChange={handleFilterChange}
            fullWidth
          >
            <MenuItem value="">All Classes</MenuItem>
            {classNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Classroom"
            name="classroom_name"
            value={filters.classroom_name}
            onChange={handleFilterChange}
            fullWidth
          >
            <MenuItem value="">All Classrooms</MenuItem>
            {classroomNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
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
            fullWidth
          />
          <TextField
            label="End Date"
            type="date"
            name="end_date"
            value={filters.end_date}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <Button variant="contained" color="primary" onClick={handleFilterSubmit}>
            Apply Filters
          </Button>
        </Stack>
      </Paper>

      {/* ✅ Search Bar */}
      <TextField
        variant="outlined"
        placeholder="Search by student name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {/* ✅ Export Buttons */}
      <Stack direction="row" spacing={2} mb={2}>
        <Button variant="outlined" onClick={exportToExcel}>
          Export Excel
        </Button>
        <Button variant="outlined" onClick={exportToCSV}>
          Export CSV
        </Button>
        <Button variant="outlined" onClick={exportToPDF}>
          Export PDF
        </Button>
      </Stack>

      {/* ✅ Attendance Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table stickyHeader>
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
                  .map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.student_name}</TableCell>
                      <TableCell>{record.class_name}</TableCell>
                      <TableCell>{record.classroom_name}</TableCell>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={record.status === "present" ? "success" : "error"}
                          size="small"
                        />
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
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAttendance.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default Attendance;

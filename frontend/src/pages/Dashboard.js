import { Box, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    presentToday: 0,
    absentToday: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Replace with actual API calls when endpoints are ready
        const studentsResponse = await api.get('/api/students/');
        const attendanceResponse = await api.get('/api/attendance/');
        
        setStats({
          totalStudents: studentsResponse.data.length,
          todayAttendance: attendanceResponse.data.length,
          presentToday: attendanceResponse.data.filter(a => a.status === 'present').length,
          absentToday: attendanceResponse.data.filter(a => a.status === 'absent').length,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper elevation={3}>
            <Typography color="textSecondary" gutterBottom>
              Total Students
            </Typography>
            <Typography variant="h3">
              {stats.totalStudents}
            </Typography>
          </StyledPaper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper elevation={3}>
            <Typography color="textSecondary" gutterBottom>
              Today's Attendance
            </Typography>
            <Typography variant="h3">
              {stats.todayAttendance}
            </Typography>
          </StyledPaper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper elevation={3}>
            <Typography color="textSecondary" gutterBottom>
              Present Today
            </Typography>
            <Typography variant="h3" color="success.main">
              {stats.presentToday}
            </Typography>
          </StyledPaper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper elevation={3}>
            <Typography color="textSecondary" gutterBottom>
              Absent Today
            </Typography>
            <Typography variant="h3" color="error.main">
              {stats.absentToday}
            </Typography>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
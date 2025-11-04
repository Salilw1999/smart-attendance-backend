import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { api } from '../services/api'; // ✅ Make sure this file exports axios instance

// Styled card container
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  textAlign: 'center',
  borderRadius: 12,
}));

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    presentToday: 0,
    absentToday: 0,
  });

  const [loading, setLoading] = useState(true);

  // ✅ Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/attendance/api/attendance/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Dashboard
      </Typography>

      {loading ? (
        <Typography variant="body1">Loading...</Typography>
      ) : (
        <Grid container spacing={3}>
          {/* Total Students */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={4}>
              <Typography color="textSecondary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h3">{stats.totalStudents}</Typography>
            </StyledPaper>
          </Grid>

          {/* Today's Attendance */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={4}>
              <Typography color="textSecondary" gutterBottom>
                Today's Attendance
              </Typography>
              <Typography variant="h3">{stats.todayAttendance}</Typography>
            </StyledPaper>
          </Grid>

          {/* Present Today */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={4}>
              <Typography color="textSecondary" gutterBottom>
                Present Today
              </Typography>
              <Typography variant="h3" color="success.main">
                {stats.presentToday}
              </Typography>
            </StyledPaper>
          </Grid>

          {/* Absent Today */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={4}>
              <Typography color="textSecondary" gutterBottom>
                Absent Today
              </Typography>
              <Typography variant="h3" color="error.main">
                {stats.absentToday}
              </Typography>
            </StyledPaper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;

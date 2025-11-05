import { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import background from '../assets/layout-background2.jpg';

const validationSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const result = await login(values.username, values.password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    },
  });

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 6,
            borderRadius: 4,
            width: '100%',
            maxWidth: 500,
            background: 'rgba(123, 47, 247, 0.3)', // soft transparent purple
            backdropFilter: 'blur(12px)', // ✅ glass blur effect
            border: '1px solid rgba(255, 255, 255, 0.2)', // soft white border
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <img src={logo} alt="App Logo" style={{ width: 80, height: 80 }} />
          </Box>

          <Typography
            component="h1"
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: 600, color: '#fff' }}
          >
            Student Attendance System
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              margin="normal"
              id="username"
              name="username"
              label="Username"
              variant="outlined"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              sx={{
                input: {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 1,
                  color: '#000',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ccc',
                  },
                  '&:hover fieldset': {
                    borderColor: '#999',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              id="password"
              name="password"
              label="Password"
              type="password"
              variant="outlined"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{
                input: {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 1,
                  color: '#000',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ccc',
                  },
                  '&:hover fieldset': {
                    borderColor: '#999',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 4,
                py: 1.4,
                fontWeight: 600,
                fontSize: '1.1rem',
                borderRadius: 2,
                background:
                  'linear-gradient(90deg, #2196f3 0%, #00b0ff 100%)',
                boxShadow: '0 0 10px rgba(33,150,243,0.5)',
                '&:hover': {
                  background:
                    'linear-gradient(90deg, #00b0ff 0%, #2196f3 100%)',
                  boxShadow: '0 0 15px rgba(33,150,243,0.7)',
                },
              }}
            >
              Sign In
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;

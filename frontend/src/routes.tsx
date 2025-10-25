import React from 'react';
import { BrowserRouter as Router, Route, Routes as RouterRoutes } from 'react-router-dom';
import Home from './pages/Home';
import Students from './pages/Students';
import Reports from './pages/Reports';
import Dashboard from './components/Dashboard';

const AppRoutes = () => {
    return (
        <Router>
            <RouterRoutes>
                <Route path="/" element={<Home />} />
                <Route path="/students" element={<Students />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </RouterRoutes>
        </Router>
    );
};

export default AppRoutes;
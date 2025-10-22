import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import Students from './pages/Students';
import Reports from './pages/Reports';
import Dashboard from './components/Dashboard';

const Routes = () => {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/students" component={Students} />
                <Route path="/reports" component={Reports} />
                <Route path="/dashboard" component={Dashboard} />
            </Switch>
        </Router>
    );
};

export default Routes;
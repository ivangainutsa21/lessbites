import React, { Component } from 'react';
// import { Router } from 'react-router'
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";

import Login from './components/login';
import Signup from './components/signup';
import Dashboard from './components/dashboard';

const App = () => (
    <Router>
        <Switch>
            <Route path="/" exact component={Login} />
            <Route path="/signup/" component={Signup} />
            <Route path="/dashboard/" component={Dashboard} />
            </Switch>
    </Router>
);

export default App;

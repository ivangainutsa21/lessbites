import React, { Component } from 'react';
import logo from '../logo.png';
import '../App.css';
import { Link } from "react-router-dom";

import Button from '@material-ui/core/Button';

import apiConfig from '../constants/config';

class Login extends Component {

  constructor(props) {
    super(props);
    
    this.onLogin = this.onLogin.bind(this);
  }

  state={
    email: '',
    password: '',
  }
  onLogin() {
    let {email, password} = this.state;
    fetch(`${apiConfig.server}${'/login'}`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email,
				password,
			}),
    })
    .then((res) => res.json())
    .then(res => {
      if(res.token) {
        let payload = res.token.split('.')[1];
        payload = atob(payload);
        payload = JSON.parse(payload);
        this.props.history.replace('/dashboard', {payload});
      }
    });
  }

  render() {
    return (
      <div className="container" >
        <div className="content">
          <img src={logo} className="App-logo" />
          <input className="App-input" type="text"  placeholder="Email" onChange={(e) => {this.setState({email: e.target.value})}}></input>
          <input className="App-input" type="password"  placeholder="Password" onChange={(e) => {this.setState({password: e.target.value})}}></input>
          <div className="sub-content-login">
            <Link to="/">Forgot password?</Link>
            <Button
              variant="contained"
              color="secondary"
              style={{padding: "5px 50px", borderRadius: 20, textTransform: 'none'}}
              onClick={this.onLogin}
            >
              Login
            </Button>
          </div>
          <div className="sub-content-singup">
            <label style={{marginRight: 10}}>Don't have an account?</label>
            <Link to="/signup">
              <label style={{fontWeight: 'bold'}}>Create one</label>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
export default Login;

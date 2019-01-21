import React, { Component } from 'react';
import logo from '../logo.png';
import '../App.css';
import { Link } from "react-router-dom";

import Button from '@material-ui/core/Button';
import apiConfig from '../constants/config';

class Signup extends Component {

  constructor(props) {
    super(props);
    
    this.createAccount = this.createAccount.bind(this);
  }

  state = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  }
  createAccount() {
    let { firstname, lastname, email, password, confirmPassword } = this.state;
    if(!firstname || !lastname || !email || !password || !confirmPassword){
      return;
    }
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(email)) return;
    if(password !== confirmPassword) return;
    
    
    fetch(`${apiConfig.server}${'/register'}`, {
      method: 'POST',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          firstName: firstname,
          lastName: lastname,
          email,
          password,
      }),
    })
    .then((res) => res.json())
    .then((res) => {
        console.log(res);
        if(res.message) {
            console.log(res.message);
        }
        if(res.token) {
            let payload = res.token.split('.')[1];
            payload = atob(payload);
            payload = JSON.parse(payload);
            this.props.history.replace('/dashboard', {payload});
        }
    })
    .catch((err) => {
    });
  }

  render() {
    return (
      <div className="container" >
        <div className="content">
          <img src={logo} className="App-logo" />
          <input className="App-input" type="text"  placeholder="First Name" onChange={(e) => {this.setState({firstname: e.target.value})}}></input>
          <input className="App-input" type="text"  placeholder="Last Name" onChange={(e) => this.setState({lastname: e.target.value})}></input>
          <input className="App-input" type="text"  placeholder="Email" onChange={e => this.setState({email: e.target.value})}></input>
          <input className="App-input" type="text"  type="password" placeholder="Password" onChange={e => this.setState({password: e.target.value})}></input>
          <input className="App-input" type="text"  type="password" placeholder="Confirm Password" onChange={e => this.setState({confirmPassword: e.target.value})}></input>
          <Button
              variant="contained"
              color="secondary"
              style={{padding: "5px 50px", margin: "20px 0px 30px 0px", borderRadius: 20, textTransform: 'none'}}
              onClick={this.createAccount}
            >
              Create Account
            </Button>
          <div className="sub-content-singup">
            <text style={{marginRight: 10}}>Already have an account?</text>
            <Link to="/">
              <text style={{fontWeight: 'bold'}}>Sign In</text>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
export default Signup;

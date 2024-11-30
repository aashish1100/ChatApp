import React, { useContext, useRef, useState } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import './userAuthForm.css';  // Import the custom CSS for styling
import axios from "axios";
import { storeInSession } from '../common/session';
import { UserContext } from '../App';
import { Navigate } from 'react-router-dom';
import { authWithGoogle } from '../common/firebase';

function AuthForm({ type }) {
  const [error, setError] = useState('');  // For showing error messages
  const formElement = useRef(null); // Use ref to reference the form
  
  let {userAuth:{access_token},setUserAuth}=useContext(UserContext)
  
  const userAuthThroughServer = (serverRoute, formData) => {
    axios
  .post('http://localhost:3000' + serverRoute, formData, {
    headers: {
      'Content-Type': 'application/json', // Ensure the request header is set to JSON
    },
  })
  .then(({ data }) => {
    storeInSession("user", JSON.stringify(data));
    setUserAuth(data);
  })
  .catch((error) => {
    console.log("yes");
    if (error.response) {
      // Server responded with an error
      console.log(error.response);
      setError(error.response.data?.error || "An unknown error occurred.");
    } else if (error.request) {
      // Request was made, but no response received
      console.error("No response received from the server:", error.request);
      setError("Unable to connect to the server. Please try again later.");
    } else {
      // Something else went wrong
      console.error("Error occurred while making the request:", error.message);
      setError("An error occurred. Please try again.");
    }
  });

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let serverRoute = type === "signin" ? "/signin" : "/signup";

    let emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;  // regex for password validation

    let form = new FormData(formElement.current); // Use the form reference to collect data
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    // Validation
    if (!formData.email || !formData.password) {
      setError('Email and Password are required');
      return;
    }

    if (type === 'signup' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    let { fullname, email, password } = formData;

    // Validate fullname length
    if (type === 'signup' && fullname.length < 3) {
      setError("Full name must be at least 3 characters long");
      return;
    }

    // Validate email
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    // Validate password
    if (!passwordRegex.test(password)) {
      setError("Password should be 6 to 20 characters long with at least 1 numeric, 1 lowercase, and 1 uppercase letter");
      return;
    }

  

    // Clear any previous error messages
    setError('');

    // Send the form data to the backend
    userAuthThroughServer(serverRoute, formData);
  };

const handleGoogleAuth=(e)=>
{
  e.preventDefault();

  authWithGoogle().then(user=>
  {
    let serverRoute="/google-auth";

    let formData ={
      access_token:user.accessToken
    }

    userAuthThroughServer(serverRoute,formData);
  }
  )
  .catch(err=>
  {
    setError("error in google auth");
    return console.log(err);
  }
  )
}

  return (
    access_token?
    <Navigate to="/" />:
    <div className="auth-form-container">
      <div className="auth-form-card">
        <h2>{type === 'signup' ? 'Signup' : 'Login'}</h2>

        {/* Display error message */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Form */}
        <Form ref={formElement} onSubmit={handleSubmit}>
          {/* Full Name Input for Signup */}
          {type === 'signup' && (
            <Form.Group className="mb-3" controlId="fullname">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullname"
                placeholder="Enter full name"
              />
            </Form.Group>
          )}

          {/* Email Input */}
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" name="email" placeholder="Enter email" />
          </Form.Group>

          {/* Password Input */}
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" placeholder="Enter password" />
          </Form.Group>

          {/* Show Confirm Password field if Signup */}
          {type === 'signup' && (
            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control type="password" name="confirmPassword" placeholder="Confirm password" />
            </Form.Group>
          )}
         
          {/* Submit Button */}
          <Button variant="primary" type="submit" className="w-100 submit-btn">
            {type === 'signup' ? 'Sign Up' : 'Login'}
          </Button>
          {type==="signin"?
          <div 
          className="google-signin-btn-container mt-3"
          onClick={handleGoogleAuth}
          >
            <Button className="google-signin-btn w-100 btn-dark">
              <img
                src="https://th.bing.com/th/id/OIP.lsGmVmOX789951j9Km8RagHaHa?rs=1&pid=ImgDetMain"
                alt="Google Logo"
                className="google-logo"
                style={{width:"25px" ,marginRight:"10px"}}
              />
              Sign in with Google
            </Button>
          </div>:
          ""}
          {/* Toggle Link */}
          <Button
            variant="link"
            onClick={() => window.location.href = type === 'signup' ? '/login' : '/signup'}
            className="mt-3 d-block mx-auto toggle-link"
          >
            {type === 'signup' ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default AuthForm;

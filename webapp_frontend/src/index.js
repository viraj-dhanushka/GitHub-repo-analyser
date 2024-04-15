/* eslint-disable prettier/prettier */

import React from 'react';
import { render } from 'react-dom';
import { AuthProvider } from '@asgardeo/auth-react';
import 'simplebar/src/simplebar.css';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
// ----------------------------------------------------------------------

const authConfig = {
  signInRedirectURL: window.config.auth.signInRedirectURL,
  signOutRedirectURL: window.config.auth.signOutRedirectURL,
  clientID: window.config.auth.clientID,
  baseUrl: window.config.auth.baseUrl,
  scope: ["openid", "profile"],
};

// {
//   signInRedirectURL: "http://localhost:3000",
//   signOutRedirectURL: "http://localhost:3000",
//   clientID: "QScqUpPZAz5QFqRnHW6B1HHevM0a",
//   baseUrl: "https://api.asgardeo.io/t/esle",
//   scope: [ "openid","profile" ]
// } 

const Index = () => (
  <AuthProvider config={ authConfig}>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </AuthProvider>
);

render(<Index />, document.getElementById('root'));

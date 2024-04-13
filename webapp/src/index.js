/* eslint-disable prettier/prettier */

import React from 'react';
import { render } from 'react-dom';
import { AuthProvider } from '@asgardeo/auth-react';
import 'simplebar/src/simplebar.css';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
// ----------------------------------------------------------------------

const Index = () => (
  <AuthProvider 
  config={ {
    signInRedirectURL: "http://localhost:3000",
    signOutRedirectURL: "http://localhost:3000",
    clientID: "QScqUpPZAz5QFqRnHW6B1HHevM0a",
    baseUrl: "https://api.asgardeo.io/t/esle",
    scope: [ "openid","profile" ]
} }
  >
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </AuthProvider>
);

render(<Index />, document.getElementById('root'));

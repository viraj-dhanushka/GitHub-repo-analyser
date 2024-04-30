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
  scope: window.config.auth.scope,
};

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

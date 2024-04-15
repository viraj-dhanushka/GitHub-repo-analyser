/* eslint-disable prettier/prettier */
/* eslint-disable no-nested-ternary */
import { useAuthContext } from '@asgardeo/auth-react';
import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Router from './routes';
import ThemeConfig from './theme';
import GlobalStyles from './theme/globalStyles';
import ScrollToTop from './components/ScrollToTop';
import { BaseOptionChartStyle } from './components/charts/BaseOptionChart';
import Login from './pages/Login';
import Loader from './pages/Loader';

export default function App() {
  const { state, signIn, signOut } = useAuthContext();

  const getIsInitLogin = () => {
    if (sessionStorage.getItem('isInitLogin') === 'true') {
      return true;
    }
    return false;
  };


  return (
    <div className="App">
      {state.isAuthenticated ? (
        <ThemeConfig>
          <ScrollToTop />
          <GlobalStyles />
          <BaseOptionChartStyle />
          <Router />
        </ThemeConfig>
      ) : getIsInitLogin() ? (
        <Loader />
      ) : (
        <Login />
      )}
    </div>
  );
}

/* eslint-disable prettier/prettier */


export const OAUTH_CONFIG = {
  SKIP_TOKEN_EXCHANGE: false,
  BEARER_TOKEN: process.env.REACT_APP_CHOREO_TOKEN,
  TOKEN_APIS: {
    MSAL_TOKEN_EXCHANGE: process.env.REACT_APP_MSAL_TOKEN_EXCHANGE_URL,
    MSAL_TOKEN_EXCHANGE_AUTH_HEADER: process.env.REACT_APP_MSAL_TOKEN_EXCHANGE_AUTH_HEADER
  }
};

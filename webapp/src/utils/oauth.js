/* eslint-disable prettier/prettier */

const OAUTH_CONFIG = {
  SKIP_TOKEN_EXCHANGE: false,
  BEARER_TOKEN: process.env.REACT_APP_CHOREO_TOKEN,
  TOKEN_APIS: {
    MSAL_TOKEN_EXCHANGE: process.env.REACT_APP_MSAL_TOKEN_EXCHANGE_URL,
    MSAL_TOKEN_EXCHANGE_AUTH_HEADER: process.env.REACT_APP_MSAL_TOKEN_EXCHANGE_AUTH_HEADER
  }
};


let idToken = null;
let refreshTokenFunction = null;
let apiToken = null;
let getNewAPITokenTries = 0;

export async function refreshToken(callback) {
  if (refreshTokenFunction) {
    try {
      const returnedIdToken = await refreshTokenFunction();
      if (returnedIdToken) setIdToken(returnedIdToken);
      if (OAUTH_CONFIG.SKIP_TOKEN_EXCHANGE) {
        if (callback) callback();
      } else {
        getNewAPIToken(callback);
      }
    } catch (e) {
      console.error('Could not refresh access token!');
    }
  }
}

export function setRefreshTokenFunction(refreshFunction) {
  refreshTokenFunction = refreshFunction;
}

export function setToken(token) {
  apiToken = token;
}

export function getToken() {
  return OAUTH_CONFIG.SKIP_TOKEN_EXCHANGE ? OAUTH_CONFIG.BEARER_TOKEN : apiToken;
}

export async function setIdToken(token) {
  idToken = token;
}

export function getIdToken() {
  return idToken;
}

export async function getNewAPIToken(callback) {
  console.log('getNewAPIToken: ');

  if (!idToken || !idToken.length) {
    return null;
  }

  const headers = {
    token: idToken,
    'API-Key': `${OAUTH_CONFIG.TOKEN_APIS.MSAL_TOKEN_EXCHANGE_AUTH_HEADER}`
  };

  try {
    console.log(headers);
    const fetchResult = fetch(OAUTH_CONFIG.TOKEN_APIS.MSAL_TOKEN_EXCHANGE, {
      method: 'GET',
      headers
    });
    const response = await fetchResult;
    const jsonData = await response.json();

    if (response.ok) {
      if (jsonData) {
        const accessToken = jsonData?.data?.header?.access_token;
        if (accessToken) {
          getNewAPITokenTries = 0;
          console.log('Access Token: ', accessToken);
          setToken(accessToken);
          if (callback) callback();
        } else {
          // Checking for callback avoids infinite looping
          // eslint-disable-next-line no-lonely-if
          if (!callback && getNewAPITokenTries < 4) {
            // eslint-disable-next-line no-plusplus
            getNewAPITokenTries++;
            refreshToken();
          }
        }
      } else {
        console.error(
          'Error when calling token endpoint! ',
          response.status,
          ' ',
          response.statusText
        );
        switch (response.status) {
          case 404:
            return 'Looks like the services of the application are under maintenance at the moment. Please try again in a few minutes.';
          case 401:
            return 'It seems that the services of the application are temporarily inaccessible. Please contact the Internal Apps Team if this continues.';
          default:
            return 'The application seems to have run into an issue! Try reloading the page. Please contact the Internal Apps Team if this continues.';
        }
      }
    }
  } catch (exception) {
    return 'Looks like the services of the application are under maintenance or unavailable at the moment. Please try again in a few minutes.';
  }
}

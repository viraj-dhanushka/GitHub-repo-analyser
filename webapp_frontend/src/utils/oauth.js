/* eslint-disable prettier/prettier */

const OAUTH_CONFIG = {
  SKIP_TOKEN_EXCHANGE: false,
  BEARER_TOKEN: window.config.REACT_APP_CHOREO_TOKEN,
  TOKEN_APIS: {
    ASGARDEO_TOKEN_EXCHANGE: window.config.REACT_APP_ASGARDEO_TOKEN_EXCHANGE_URL,
    ASGARDEO_TOKEN_EXCHANGE_AUTH_HEADER: window.config.REACT_APP_ASGARDEO_TOKEN_EXCHANGE_AUTH_HEADER
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
      console.error('Unable to refresh access token!');
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
    'API-Key': `${OAUTH_CONFIG.TOKEN_APIS.ASGARDEO_TOKEN_EXCHANGE_AUTH_HEADER}`
  };

  try {
    console.log(headers);
    const fetchResult = fetch(OAUTH_CONFIG.TOKEN_APIS.ASGARDEO_TOKEN_EXCHANGE, {
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
            return 'It appears that the application services are undergoing maintenance right now. Kindly try again in a short while.';
          case 401:
            return 'It seems that the services of the application are temporarily inaccessible. Kindly try again in a short while.';
          default:
            return 'Try reloading the page. Kindly try again in a short while.';
        }
      }
    }
  } catch (exception) {
    return 'Please try again in a few minutes.';
  }
}

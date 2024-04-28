/* eslint-disable prettier/prettier */
/* eslint-disable no-nested-ternary */

import { useAuthContext } from '@asgardeo/auth-react';
import axios from 'axios';
// import { useEffect, useState } from 'react';
// import { getToken } from './oauth';

const API_BASE_URL = window.config.REACT_APP_BASE_URL;

export default function axiosClient() {

  const { getAccessToken } = useAuthContext();
  return createAxiosInstance(getAccessToken);

}

const createAxiosInstance = async (getAccessToken) => {
  const token = await getAccessToken();

  const axiosInstance = axios.create({
    // baseURL: "http://localhost:9090/analyse",
    baseURL: API_BASE_URL,
    // TODO: uncomment this and configure
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return axiosInstance;
};

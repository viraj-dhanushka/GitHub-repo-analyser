/* eslint-disable prettier/prettier */
import axios from 'axios';
import { getToken } from './oauth';

const API_BASE_URL = window.config.REACT_APP_BASE_URL;


export default function axiosClient() {
  const axiosInstance = axios.create({
    // baseURL: "http://localhost:9090/analyse",
    baseURL: API_BASE_URL,
    //TODO: uncomment this and confihure
    // headers: {
    //   Authorization: `Bearer ${getToken()}`
    // }
  });
  return axiosInstance;
}

/* eslint-disable prettier/prettier */
import axios from 'axios';
import { getToken } from './oauth';

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

export default function axiosClient() {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
  return axiosInstance;
}

/* eslint-disable prettier/prettier */
import axios from 'axios';
import { getToken } from './oauth';

const GITHUB_API_BASE_URL = window.config.REACT_APP_GITHUB_API_BASE_URL;


export default function axiosGitHubClient() {
  const axiosGitHubInstance = axios.create({
    // baseURL: "http://localhost:9090/analyse",
    baseURL: GITHUB_API_BASE_URL,
    // TODO: uncomment this and confihure
    // headers: {
    //   Authorization: `Bearer ${getToken()}`
    // }
  });
  return axiosGitHubInstance;
}

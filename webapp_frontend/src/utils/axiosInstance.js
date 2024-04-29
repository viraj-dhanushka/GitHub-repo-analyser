/* eslint-disable prettier/prettier */
/* eslint-disable no-nested-ternary */

import axios from 'axios';

const API_BASE_URL = window.config.REACT_APP_BASE_URL;

export default function axiosClient() {
 const token = "eyJ4NXQiOiJvcWZWaEIxc3doc1FGdG1YbURzTlVVT3QyMUkiLCJraWQiOiJPR1UxT1dReU5qY3hNalkxTlROak5Ea3lObUk1TTJaak5UWmlaakZrT1RkbFltWXdNek01TkRjd05HVmxZbU0yWm1Zd01EbG1PV00wWVRRME1ETXdOUV9SUzI1NiIsInR5cCI6ImF0K2p3dCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJlNWY2ZjkyNi02ZTkyLTRiNzUtYTY1My1hODA2YzgyOWRiNWQiLCJhdXQiOiJBUFBMSUNBVElPTl9VU0VSIiwiaXNzIjoiaHR0cHM6XC9cL2FwaS5hc2dhcmRlby5pb1wvdFwvZXNsZVwvb2F1dGgyXC90b2tlbiIsImdpdmVuX25hbWUiOiJTLk0uIFZpcmFqIiwiY2xpZW50X2lkIjoiS2I0Z2lmOTBWNjMzYTZka3pYc0VjRFBKdlE4YSIsImF1ZCI6WyJLYjRnaWY5MFY2MzNhNmRrelhzRWNEUEp2UThhIiwiY2hvcmVvOmRlcGxveW1lbnQ6cHJvZHVjdGlvbiJdLCJuYmYiOjE3MTQzNjAxNjMsInVwZGF0ZWRfYXQiOjE3MTQyODEyMTUsImF6cCI6IktiNGdpZjkwVjYzM2E2ZGt6WHNFY0RQSnZROGEiLCJvcmdfaWQiOiJjNWQzY2JkZS1iODEzLTRkYmUtOWI1Mi0yNTRhZDc5MjBjYTAiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIiwiZXhwIjoxNzE0MzY5MTYzLCJvcmdfbmFtZSI6ImVzbGUiLCJpYXQiOjE3MTQzNjAxNjMsImZhbWlseV9uYW1lIjoiRGhhbnVzaGthIiwianRpIjoiOTg5MWU2NWItMDEwNi00YmRmLTgzMGQtZThkYzRmNzZjZjA3IiwidXNlcm5hbWUiOiJzbXZpcmFqQGdtYWlsLmNvbSJ9.EYT39bOfbY9gOmmBl3TqC3ZV2SZR77amxVfHzDwStR3TGhfl6hvvRpVz825hGSjvL5ZSLgepZYj8SCZmC-R5aLdzAMKda4Cty3U3xw9ZkM_kHHO714V_vV6S2E9r0cO3s5gPcW7G_r5wIiBBLlM39MOLQHUfNqdi8mBfhllJS1df1dyN2wPwfb5Gp1tpmLXYyjTiSe6aTw6aPGI7xWZeWnNs11xK5jiJ8lSEtjac4lkRlP8qRBr1SxjfuAgLlTFXu00twnOhiYFif_tqVHdM56uGiIZdkim1vv8UH-ChYeZBXv3l3okiMWxPcueGoXaoZrA9qE8vzGLrOtYvCSPdGg";
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

}

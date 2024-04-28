/* eslint-disable prettier/prettier */
/* eslint-disable no-nested-ternary */

import { useAuthContext } from '@asgardeo/auth-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { getToken } from './oauth';

const API_BASE_URL = window.config.REACT_APP_BASE_URL;

export default function axiosClient() {

  // const { getAccessToken } = useAuthContext();

  // const [setToken, token] = useState('');

//   useEffect(() => {
//     getAccessToken().then((accessToken) => {
//         console.log(accessToken);
//         // setToken(accessToken)
//     }).catch((error) => {
//         console.log(error);
//     });
// }, []);

const token = 'eyJraWQiOiJnYXRld2F5X2NlcnRpZmljYXRlX2FsaWFzIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI0MDE5MmY2ZS03OWY2LTQxMTEtYWM3Yi1hYmRkOTZlY2E4YmFAY2FyYm9uLnN1cGVyIiwiYXVkIjoiY2hvcmVvOmRlcGxveW1lbnQ6c2FuZGJveCIsImlzcyI6Imh0dHBzOlwvXC9zdHMuY2hvcmVvLmRldjo0NDNcL2FwaVwvYW1cL3B1Ymxpc2hlclwvdjJcL2FwaXNcL2ludGVybmFsLWtleSIsImtleXR5cGUiOiJTQU5EQk9YIiwic3Vic2NyaWJlZEFQSXMiOlt7InN1YnNjcmliZXJUZW5hbnREb21haW4iOm51bGwsIm5hbWUiOiJCRkYgU2VydmljZSAtIEdpdEh1YiBBbmFseXNlciBCYWNrZW5kIiwiY29udGV4dCI6IlwvYzVkM2NiZGUtYjgxMy00ZGJlLTliNTItMjU0YWQ3OTIwY2EwXC93ZWItcG9ydGFsXC9iZmYtc2VydmljZVwvZ2l0aHViLWFuYWx5c2VyLWJhY2tlbmQtYzA5XC92MS4wIiwicHVibGlzaGVyIjoiY2hvcmVvX3Byb2RfYXBpbV9hZG1pbiIsInZlcnNpb24iOiJ2MS4wIiwic3Vic2NyaXB0aW9uVGllciI6bnVsbH1dLCJleHAiOjE3MTQyODE0ODEsInRva2VuX3R5cGUiOiJJbnRlcm5hbEtleSIsImlhdCI6MTcxNDI4MDg4MSwianRpIjoiNjU4Mzc4YjctZTI1Ni00Nzc0LWExMzgtMjdkOTdhZTk3NjFhIn0.NfnATiVaYCNE0jmGpWQtT625GOj-zqiWvbe2QvS_oxuajzi0FKMUC5WOckQ_6q4MPajWgf8b6D_8WW9s2uHe5v3YWASFL7Y6vInBIyGUEbsidHMTcvRr57AQtKNZN55AWt5MKOplAujcCArenTb-B_wZA4EboIJhLbStST7uTlELyC-k_jIwd1Ha2w4ZVEZP6uQLFuVbObvnP2ZxXG6TS4t2knUoFBHhGRdZFBcfgC0z2rK_hsDzKpKTrXbmDq2tSvfe_P8dVGPVhnwmShoAQpc0Z1crpEL2AtZh1_yELsxUehJv8JM6T7wJJO9ccOLHILbqomV17San2-CItXDLg9SjN9DczZkCyFlv7nVqYAAwhj6S0MJ840mRLxDnsg1aNaxSFIJ2rmYAgmWSU7uk0stt4dnLkqptIXSNLbmuG_rO1WLxGQDB_L_QGML69RMLS1WcHr1_8O7Qyfj1ZqS-fkpNA7tG-lUEEtNnt7oIysx2JqthkCT1jnCKu4gYfh_UoGexZrnklfjVaP6GcK3F56IBK1zRuQIP0QXXawncj85Yx4zJg92GPjPWqCbMN9yhd3KhqDHrmfHefN5R1BIqDN2eY7MuLxoLSnMIwSOVU9SfrekHSXOGXfPLlcw-RnDxMx02R_mt88Grnm4mLq43kVyDtGPeHOMHewkAJTKqbaI';

  console.log("viraj at : " );
  console.log("viraj at : " );
  const axiosInstance = axios.create({
    // baseURL: "http://localhost:9090/analyse",
    baseURL: API_BASE_URL,
    // TODO: uncomment this and confihure
    headers: {
      Authorization: `API-Key ${token}`
    }
  });
  return axiosInstance;
}

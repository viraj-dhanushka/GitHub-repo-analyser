/* eslint-disable prettier/prettier */
/* eslint-disable no-nested-ternary */

import axios from 'axios';

const API_BASE_URL = window.config.REACT_APP_BASE_URL;

export default function axiosClient() {
 const token = 'eyJ4NXQiOiJvcWZWaEIxc3doc1FGdG1YbURzTlVVT3QyMUkiLCJraWQiOiJPR1UxT1dReU5qY3hNalkxTlROak5Ea3lObUk1TTJaak5UWmlaakZrT1RkbFltWXdNek01TkRjd05HVmxZbU0yWm1Zd01EbG1PV00wWVRRME1ETXdOUV9SUzI1NiIsInR5cCI6ImF0K2p3dCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJlNWY2ZjkyNi02ZTkyLTRiNzUtYTY1My1hODA2YzgyOWRiNWQiLCJhdXQiOiJBUFBMSUNBVElPTl9VU0VSIiwiaXNzIjoiaHR0cHM6XC9cL2FwaS5hc2dhcmRlby5pb1wvdFwvZXNsZVwvb2F1dGgyXC90b2tlbiIsImNsaWVudF9pZCI6IlFTY3FVcFBaQXo1UUZxUm5IVzZCMUhIZXZNMGEiLCJhdWQiOiJRU2NxVXBQWkF6NVFGcVJuSFc2QjFISGV2TTBhIiwibmJmIjoxNzE0MzE3Nzc1LCJhenAiOiJRU2NxVXBQWkF6NVFGcVJuSFc2QjFISGV2TTBhIiwib3JnX2lkIjoiYzVkM2NiZGUtYjgxMy00ZGJlLTliNTItMjU0YWQ3OTIwY2EwIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSIsImV4cCI6MTcxNDMyMTM3NSwib3JnX25hbWUiOiJlc2xlIiwiaWF0IjoxNzE0MzE3Nzc1LCJqdGkiOiIxNzUyYTc2Yy04ZGVkLTRiYmQtYjBlYi0xMzMxOTEyYWJjZTciLCJ1c2VybmFtZSI6InNtdmlyYWpAZ21haWwuY29tIn0.kzQQQv28-asm5q2DHROWwgXbwM3kg-FKBZ7wYMA4e8a558IPViAwGV8qD66JemO-xlBPzaElvmULTn7s2Xcunof4fIlFLDRlTtapxMMChnZzBPe6CETfynyjpsfYyT_G-IPhsau4VJ56iufYVrtFw24_RtZPbQu3Momr_6firaJGkd65Sa0mWdVbUEtcUz_yZL1ApQ5XWeYiQlZRRQeG7Pc0cF9WUe2Ll2uXeTHY7JZt8bWCiDplKhqcyACmWGiRtcV785ZQFi1_8iFGM_26DzlBKxhPPn0IEs8imAD5tstjywpS20pTPz_AMYInq7RKg7z4j1oVp8aDFPtsaUJUgQ';
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

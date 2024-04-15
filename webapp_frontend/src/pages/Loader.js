/* eslint-disable prettier/prettier */

// material
import { styled } from '@mui/material/styles';
import { Card, Stack, Container, Typography, LinearProgress } from '@mui/material';
import Button from '@mui/material/Button';
import { useAuthContext } from "@asgardeo/auth-react";
import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Page from '../components/Page';
// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2),
  raised: true
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '5vh',
  flexDirection: 'column',
  justifyContent: 'center',
  verticalAlign: 'middle',
  padding: theme.spacing(12, 0)
}));

// ----------------------------------------------------------------------

export default function Loader() {
  // const setIsInitLogin = (value) => {
  //   sessionStorage.setItem('isInitLogin', value);
  // };

  // const handleWaiting = (instance) => {
  //   setIsInitLogin('false');
  //   instance.logoutRedirect().catch((e) => {
  //     setIsInitLogin('true');
  //     console.error(e);
  //   });
  // };

  return (
    <RootStyle title="Loading... | Repo Analyser">
      <Container maxWidth="md">
        <ContentStyle>
          <Stack>
          
            <SectionStyle sx={{mt:10}}>
              <Container sx={{m:2, pb:2}}>
                <Stack direction="row" alignItems="center" spacing={2} mb={5} mt={5} ml={5} mr={5}>
                  <CircularProgress sx={{ml:7}} />

                  <Typography variant="h4">Loading...  </Typography>
                 
                  {/* <img src="/static/logo.svg" alt="login" /> */}
                </Stack>                

                <Typography variant="body2" align="center">
                  <Button
                    size="small"
                    color="primary"
                    variant="text"
                    // onClick={() => handleWaiting(instance)}
                    onClick={() => {}}
                  >
                    Click here
                  </Button>{' '}
                  if you have been waiting for too long.....
                </Typography>
              </Container>
              <LinearProgress />
            </SectionStyle>
          </Stack>
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}

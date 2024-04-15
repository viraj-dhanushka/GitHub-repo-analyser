/* eslint-disable prettier/prettier */
/* eslint-disable react/no-unknown-property */ 

import React from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { styled, createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import { Card, Stack, Container, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Page from '../components/Page';
// ----------------------------------------------------------------------

let Fonttheme = createTheme();
Fonttheme = responsiveFontSizes(Fonttheme);

const theme = createTheme({
  palette: {
    primary: {
      main: '#0077B5',
      darker: '#00476D'
    }
  }
});

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
  margin: theme.spacing(2, 0, 2, 2)
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '1vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0)
}));

// ----------------------------------------------------------------------

export default function Login() {
  const { signIn } = useAuthContext();

  return (
    <RootStyle title="Login | CSSMT">
      {/* <MHidden width="mdDown">  This does not work due to Asgardeo conflict. FIX */}
      <Container maxWidth="xl">
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Container maxWidth="xs">
              <ContentStyle>
                <Stack sx={{ mb: 5 }}>
                  <SectionStyle>
                    <ThemeProvider theme={Fonttheme}>
                      <Typography variant="h4" sx={{ px: 7, mt: 5 }}>
                        Hi, Welcome Back
                      </Typography>
                    </ThemeProvider>

                    <img src="/static/logo.png" alt="login" sx={{ mb: 5 }} />
                  </SectionStyle>
                </Stack>
              </ContentStyle>

              {/* </MHidden> */}
            </Container>
          </Grid>
          <Grid item xs={6}>
            <Container maxWidth="xs">
              <ContentStyle>
                <Stack sx={{ mb: 5 }}>
                  <ThemeProvider theme={Fonttheme}>
                    <Typography variant="h4" gutterBottom sx={{ mt: 10 }}>
                      Sign in to Security Status Monitoring Tool
                    </Typography>

                    <Typography sx={{ color: 'text.secondary' }}>
                      Click the login button below. 
                      {window.config.todoApiUrl}
                    </Typography>
                  </ThemeProvider>
                </Stack>
                <Stack sx={{ mb: 5 }}>
                  <ThemeProvider theme={theme}>
                    <LoadingButton
                      color="primary"
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      onClick={() => signIn()}
                    >
                      Login
                    </LoadingButton>
                  </ThemeProvider>
                </Stack>
              </ContentStyle>
            </Container>
          </Grid>
        </Grid>
      </Container>
    </RootStyle>
  );
}

/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable no-template-curly-in-string */
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import link2Fill from '@iconify/icons-eva/link-2-fill';
import { useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Card,
  CardContent,
  Box,
  Stack,
  Button,
  Container,
  Typography,
  Link
} from '@mui/material';

import * as React from 'react';
import axiosGitHubClient from '../utils/axiosGitHubInstance';
import { fToNow } from '../utils/formatTime';
import Page from '../components/Page';


// ----------------------------------------------------------------------

const ORG_NAME = window.config.REACT_APP_ORG_NAME;


export default function Repos() {
  const RepoDetails = useLocation();
  const { repoId, createdDate, repoDescrption, repoLink, name, watchStatus, repoTag } =
    RepoDetails.state;

  const [loading, setLoading] = useState(false);

  const startSpinner = () => {
    setLoading(true);
  };

  const stopSpinner = () => {
    setLoading(false);
  };

  useEffect(() => {
    startSpinner();
    fullRepository(name);
  }, []);

  const [json, setJson] = useState({});

  async function fullRepository(name) {
    axiosGitHubClient()
      .get(`/fullRepository/${ORG_NAME}/${name}`)
      .then((getData) => {
        setJson(getData.data);
        stopSpinner();
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.reload(false); // reload the page
        }
      });
  }


  return (
    <Page title="Specific Repos | Repo Analyser">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Stack
            direction="column"
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={0.5}
          >
            <Typography variant="h4" gutterBottom>
              {name}
            </Typography>

            <Typography variant="body1" color="blue" gutterBottom>
              {repoDescrption}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-even"
              spacing={2}
              mb={5}
            >
              <Typography variant="body2">
                <span>🕓</span> repo created {' '}
                <Box fontWeight="fontWeightMedium" display="inline">
                  {fToNow(createdDate)}
                </Box>
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="column" justifyContent="flex-start" alignItems="left" spacing={0.5}>
            <Button
              variant="contained"
              startIcon={<Icon icon={link2Fill} />}
              component={Link}
              target="_blank"
              href={repoLink}
            >
              Visit Repo
            </Button>
          </Stack>
        </Stack>
        <Stack>
          <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
            All the Available Data as a JSON :
          </Typography>
          {loading && (
            <CircularProgress />
          )}
          {!loading && (
            <Card variant="outlined">
              <CardContent>
                <pre>{JSON.stringify(json, null, 2)}</pre>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Container>
    </Page>
  );
}

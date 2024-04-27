/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable no-template-curly-in-string */

import { MuiMarkdown } from 'mui-markdown';
import { Icon } from '@iconify/react';
import { useRef, useEffect, useState } from 'react';
import downloadFill from '@iconify/icons-eva/download-fill';

import {
  Stack,
  Button,
  Container,
  Typography,
} from '@mui/material';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import axiosClient from '../utils/axiosInstance';
import Page from '../components/Page';

const repo = 'viraj-dhanushka/GitHub-repo-analyser'; // Enter the repository in format 'username/repository'

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const ORG_NAME = window.config.REACT_APP_ORG_NAME;


export default function Settings() {
  const [open, setOpen] = React.useState(false);
  const [multipleReposGetToggle, setMultipleReposGetToggle] = useState(false);
  const [singleReposGetToggle, setSingleReposGetToggle] = useState(false);

  const valueRef = useRef('');

  const handleClickOpen = (param) => (e) => {
    setOpen(true);
    if (param.clickedItem === 'multipleRepos') {
      setMultipleReposGetToggle(true);
    } else if (param.clickedItem === 'singleRepo') {
      setSingleReposGetToggle(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMultipleReposGetToggle(false);
    setSingleReposGetToggle(false);
  };

  const handleAgree = () => {
    if (multipleReposGetToggle) {
      getLatestRepoDetails();
    } else if (singleReposGetToggle) {
      getSingleRepository(valueRef.current.value.trim());
    }
    handleClose();
  };

  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);

  const startSpinner = () => {
    setLoading(true);
  };
  const stopSpinner = () => {
    setLoading(false);
  };
  const clearApiData = () => {
    setApiData([]);
  };

  async function getLatestRepoDetails() {
    startSpinner();
    axiosClient()
      .post(`/addRepos/${ORG_NAME}`)
      .then(() => {
        console.log('Successfully updated');
        // getLatestLanguageDetails();
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.reload(false); // reload the page
        }
      });
  }


  async function getSingleRepository(repoName) {
    startSpinner();
    axiosClient()
      .post(`/addRepoByName/${ORG_NAME}/${repoName}`)
      .then(() => {
        console.log('Successfully imported a new repo');
        stopSpinner();
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.reload(false); // reload the page
        }
      });
  }


  const [readmeContent, setReadmeContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${repo}/readme`);
        if (!response.ok) {
          throw new Error('Failed to fetch README');
        }
        const data = await response.json();
        const readmeResponse = await fetch(data.download_url);
        if (!readmeResponse.ok) {
          throw new Error('Failed to fetch README content');
        }
        const readmeContent = await readmeResponse.text();
        setReadmeContent(readmeContent);
      } catch (error) {
        setError(error.message);
      }
    };

    if (repo) {
      fetchReadme();
    }
  }, []);

  return (
    <Page title="Settings | Repo Analyser">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Settings
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="space-even" spacing={2} mb={5}>
            <Button
              variant="contained"
              endIcon={<Icon icon={downloadFill} />}
              onClick={handleClickOpen({
                clickedItem: 'multipleRepos'
              })}
            >
              Get Multiple Repositories
            </Button>

            <Button
              variant="contained"
              endIcon={<Icon icon={downloadFill} />}
              onClick={handleClickOpen({
                clickedItem: 'singleRepo'
              })}
            >
              Get Single Repo
            </Button>

            <div>
              <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
              >
                <DialogTitle>
                  {singleReposGetToggle && <box>Do You Find Particular Repository is Missing?</box>}
                  {!singleReposGetToggle && (
                    <box>
                      Do You Find Multiple Repositories are Missing?
                    </box>
                  )}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-slide-description">
                    {singleReposGetToggle && (
                      <box>
                        Please make sure to enter the correct repository name which is displayed in GitHub
                      </box>
                    )}
                    {!singleReposGetToggle && (
                      <box>
                        Please use this if you are certain that multiple repositories are NOT available in the system. This will take few minutes to complete the process.
                      </box>
                    )}
                  </DialogContentText>
                  {singleReposGetToggle && (
                    <TextField
                      autoFocus
                      margin="dense"
                      // id={props.id}
                      label="Add New Repo"
                      fullWidth
                      variant="standard"
                      inputRef={valueRef}
                    />
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button onClick={handleAgree}>OK</Button>
                </DialogActions>
              </Dialog>
            </div>
          </Stack>
        </Stack>

        <Typography variant="h6" color="green" paddingTop={6} paddingBottom={3}>
          GitHub-repo-analyser README.md
        </Typography>
        <MuiMarkdown>{readmeContent}</MuiMarkdown>
      </Container>
    </Page>
  );
}

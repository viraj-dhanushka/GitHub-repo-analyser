/* eslint-disable prettier/prettier */

import { useAuthContext } from '@asgardeo/auth-react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Box, Button, MenuItem, ListItemText, IconButton } from '@mui/material';
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuPopover from '../../components/MenuPopover';
import axiosClient from '../../utils/axiosInstance';
// ----------------------------------------------------------------------

const DEFAULT_TAG = window.config.REACT_APP_DEFAULT_TAG;
const API_BASE_URL = window.config.REACT_APP_BASE_URL;

function stringToColor(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const tagId = (hash >> (i * 8)) & 0xff;
    color += `00${tagId.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name)
    },
    children: `${name[0].toUpperCase()}${name[1].toUpperCase()}`
  };
}

export default function TeamsPopover() {
  const { getAccessToken, refreshAccessToken } = useAuthContext();
  const [currentTag, setCurrentTag] = useState(DEFAULT_TAG);
  const [deleteTagName, setDeleteTagName] = useState('');

  const [apiData, setApiData] = useState([]);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  async function getTagsList() {

    const token = await getAccessToken();
    // const axiosInstance = axios.create({
    //   baseURL: API_BASE_URL,
    //   // TODO: uncomment this and configure
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${token}`,
    //   },
    // });
    // axiosInstance
    //   .get(`/getTagsList`)
    //   .then((getData) => {
    //     console.log('TagList : ', getData.data);
    //     setApiData(getData.data);
    //   })
    //   .catch((error) => {
    //     if (error.response.status === 401) {
    //       console.log('Error Tag : ', error.response);
    //       // window.location.reload(false); // reload the page
    //     }
    //   });
    
    fetch(`${API_BASE_URL}/getTagsList`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${token}`,
      }
    }).then((response) => {
      if (response.status >= 400) {
        if (response.status === 401) {
          refreshAccessToken();
        }
        // return response.json().then((data) => {
        //   throw new Error(`Error fetching data from graphql: ${JSON.stringify(data)}`);
        // });
      } 
      console.log('Response : ', response);
    }).then((data) => setApiData(data.data));

  }

  useEffect(() => {
    getTagsList();
    localStorage.setItem('currentTag', currentTag);
    // console.log('add');
    document.addEventListener('createTag', handleCreateTag, false);
    return () => {
      // console.log('remove');
      document.removeEventListener('createTag', handleCreateTag, false);
    };
  }, []);

  const handleCreateTag = () => {
    getTagsList();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = (param) => (e) => {
    setOpen(false);
    setCurrentTag(param.tagName);
    localStorage.setItem('currentTag', param.tagName);

    // create new event
    const selectTagEvent = new CustomEvent('selectTag', {
      bubbles: true,
      detail: param.tagName
    });
    document.dispatchEvent(selectTagEvent);
  };

  const handleDialogOpen = (param) => (e) => {
    setDialogOpen(true);
    setDeleteTagName(param.deletingTag);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogDelete = () => {
    setDialogOpen(false);

    if (currentTag === deleteTagName) {
      setCurrentTag(DEFAULT_TAG);
      localStorage.setItem('currentTag', DEFAULT_TAG);
      console.log('currentTag ===deleteTagName');
    }
    deleteTag(deleteTagName);
    console.log('deletingTag ===', deleteTagName);
  };

  const handleEmptyList = () => {
    window.location.reload(false); // reload the page
  };

  async function deleteTag(tagName) {
    axiosClient()
      .delete(`/deleteTag/${tagName}`)
      .then(() => {
        console.log('deleted success');
        getTagsList();
        window.location.reload(false);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.reload(false); // reload the page
        }
      });
  }

  return (
    <>
      {apiData.length === 0 && (
        <Avatar {...stringAvatar('ÖÖ')} onClick={handleEmptyList} ref={anchorRef} />
      )}
      {apiData.length !== 0 && (
        <Avatar {...stringAvatar(currentTag)} onClick={handleOpen} ref={anchorRef} />
      )}
      <MenuPopover open={open} onClose={handleClose} anchorEl={anchorRef.current}>
        <Box sx={{ py: 1 }}>
          {apiData.map((option) => (
            <MenuItem
              key={option.id}
              selected={option.name === currentTag}
              onClick={handleClick({
                tagName: option.name
              })}
              sx={{ py: 1, px: 2.5 }}
            >
              <Avatar {...stringAvatar(option.name)} onClick={handleClose} />
              <ListItemText primaryTypographyProps={{ variant: 'body2' }}>
                {`- - - ${option.name}`}
              </ListItemText>
              <IconButton
                aria-label="delete"
                disabled={option.id === apiData[0].id}
                color="error"
                onClick={handleDialogOpen({
                  deletingTag: option.name
                })}
              >
                <DeleteIcon />
              </IconButton>
            </MenuItem>
          ))}
        </Box>
      </MenuPopover>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Delete TAG Permanently</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure that you want to delete this tag permanently
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

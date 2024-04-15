/* eslint-disable prettier/prettier */


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

const ORG_ID = process.env.REACT_APP_ORG_ID;
const DEFAULT_TAG = process.env.REACT_APP_DEFAULT_TAG;

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
  const [currentTag, setCurrentTag] = useState(DEFAULT_TAG);
  const [deleteTagName, setDeleteTagName] = useState('');

  const [apiData, setApiData] = useState([]);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  async function getTagsList() {
    axiosClient()
      .get(`/getTagsList/${ORG_ID}`)
      .then((getData) => {
        // console.log('TagList : ', getData.data);
        setApiData(getData.data);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.reload(false); // reload the page
        }
      });
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
      .delete(`/deleteTag/${ORG_ID}/${tagName}`)
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
/* eslint-disable prettier/prettier */


import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';
import editFill from '@iconify/icons-eva/edit-fill';
import textFill from '@iconify/icons-eva/text-fill';
import bookmarkOutline from '@iconify/icons-eva/bookmark-outline';
import { Link as RouterLink } from 'react-router-dom';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
import * as React from 'react';
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import axiosClient from '../../../utils/axiosInstance';
// ----------------------------------------------------------------------

export default function RepoMoreMenu(props) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const valueRef = useRef('');
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setIsOpen(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = () => {
    const tagName = valueRef.current.value.trim();

    if (tagName.length >= 2) {
      props.clearApiData();
      props.startSpinner();

      axiosClient()
        .post(`/addTag/${tagName}`)
        .then(() => {
          sendDataToAPI(
            props.id,
            props.repoFavStatus === '1' ? 1 : 0,
            tagName
          );
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === 401) {
            window.location.reload(false);
          } else {
            sendDataToAPI(
              props.id,
              props.repoFavStatus === '1' ? 1 : 0,
              tagName
            );
          }
        });
      handleClose();
    } else {
      alert('Please enter TAG consists of minimum 2 characters');
    }
  };

  const sendDataToAPI = (id, repoFavStatus, tag) => {

    axiosClient()
      .put(`/changeRepoWatchInfo/${id}/${repoFavStatus}/${tag}`)
      .then(() => {
        props.getLatestApiData();
        // create new event
        const selectTagEvent = new CustomEvent('createTag', {
          bubbles: true,
          detail: tag
        });
        document.dispatchEvent(selectTagEvent);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.reload(false); // reload the page
        } else {
          props.getLatestApiData();
        }
      });
  };

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Icon icon={moreVerticalFill} width={20} height={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' }
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          sx={{ color: 'text.secondary' }}
          onClick={() => {
            setIsOpen(false);

            props.clearApiData();
            props.startSpinner();

            sendDataToAPI(
              props.id,
              1,
              props.tag
            );
          }}
        >
          <ListItemIcon>
            <Icon icon={bookmarkOutline} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Add to Favourite" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>

        <MenuItem
          sx={{ color: 'text.secondary' }}
          onClick={() => {
            setIsOpen(false);

            props.clearApiData();
            props.startSpinner();

            sendDataToAPI(
              props.id,
              0,
              props.tag
            );
          }}
        >
          <ListItemIcon>
            <Icon icon={trash2Outline} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Make Non Fav" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>

        <MenuItem sx={{ color: 'text.secondary' }} onClick={handleClickOpen}>
          <ListItemIcon>
            <Icon icon={textFill} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Tag" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </Menu>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Tag Name</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the TAG here. And note that this field is case sensitive. Hence always make
            sure to enter an exact tag name considering inter whitespaces, case etc.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id={props.id}
            label="Team Name"
            fullWidth
            variant="standard"
            inputRef={valueRef}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleChange}>Add Tag</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

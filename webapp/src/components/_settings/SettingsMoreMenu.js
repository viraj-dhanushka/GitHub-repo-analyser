/* eslint-disable prettier/prettier */


import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosClient from '../../utils/axiosInstance';
// ----------------------------------------------------------------------

export default function SettingsMoreMenu(props) {
  const [open, setOpen] = React.useState(false);

  const [addToolsToggle, setAddToolsToggle] = useState(false);
  const [deleteToolsToggle, setDeleteToolsToggle] = useState(true);

  const valueRef = useRef('');

  const handleClickOpen = (param) => (e) => {
    setOpen(true);
    if (param.clickedItem === 'add') {
      setAddToolsToggle(true);
    } else if (param.clickedItem === 'delete') {
      setDeleteToolsToggle(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAddToolsToggle(false);
    setDeleteToolsToggle(false);
  };

  const handleChange = () => {
    props.startSpinner();

    console.log(addToolsToggle);
    console.log(deleteToolsToggle);
    // changeTestingTool(props.id, props.orgId, props.name, valueRef.current.value);
    if (addToolsToggle) {
      addTestingTool(
        props.id,
        props.orgId,
        props.name,
        props.testingTools,
        valueRef.current.value.trim()
      );
    } else if (deleteToolsToggle) {
      deleteTestingTool(
        props.id,
        props.orgId,
        props.name,
        props.testingTools,
        valueRef.current.value.trim()
      );
    }
    handleClose();
  };

  const addTestingTool = (id, orgId, name, testingTools, newTestingTool) => {
    if (newTestingTool !== '') {
      const payload = {
        id,
        name,
        testingTools,
        orgId
      };
      console.log(payload);
      axiosClient()
        .post(`/addTestingTool/${newTestingTool}`, payload)
        .then(() => {
          props.clearApiData();
          props.getLatestApiData();
        })
        .catch((error) => {
          if (error.response.status === 401) {
            window.location.reload(false); // reload the page
          }
        });
    } else {
      console.log('empty'); // TODO: add https://mui.com/material-ui/react-snackbar/#customized-snackbars
      props.stopSpinner();
    }
  };

  const deleteTestingTool = (id, orgId, name, testingTools, deletingTestingTool) => {
    if (deletingTestingTool !== '') {
      const payload = {
        id,
        name,
        testingTools,
        orgId
      };
      console.log(deletingTestingTool);
      axiosClient()
        .post(`/deleteTestingTool/${deletingTestingTool}`, payload)
        .then(() => {
          props.clearApiData();
          props.getLatestApiData();
        })
        .catch((error) => {
          if (error.response.status === 401) {
            window.location.reload(false); // reload the page
          }
        });
    } else {
      console.log('empty'); // TODO: add https://mui.com/material-ui/react-snackbar/#customized-snackbars
      props.stopSpinner();
    }
  };

  return (
    <>
      <Stack direction="row" spacing={5}>
        <Button
          size="small"
          variant="contained"
          color="success"
          startIcon={<Icon icon={plusFill} />}
          onClick={handleClickOpen({
            clickedItem: 'add'
          })}
        >
          Add Scanning Tool
        </Button>
        <IconButton
          aria-label="delete"
          enabled
          color="error"
          onClick={handleClickOpen({
            clickedItem: 'delete'
          })}
        >
          <DeleteIcon />
        </IconButton>
      </Stack>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {(addToolsToggle && 'Add New') || (deleteToolsToggle && 'Delete')} Testing Tool
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter the new testing tool name here.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id={props.id}
            label={
              (addToolsToggle && 'New Scanning Tool') ||
              (deleteToolsToggle && 'Delete Scanning Tool')
            }
            fullWidth
            variant="standard"
            inputRef={valueRef}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleChange}>
            {(addToolsToggle && 'Add') || (deleteToolsToggle && 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

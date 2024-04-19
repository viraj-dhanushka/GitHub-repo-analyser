/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable no-template-curly-in-string */



import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { useRef, useEffect, useState } from 'react';
import downloadFill from '@iconify/icons-eva/download-fill';
import CircularProgress from '@mui/material/CircularProgress';
import plusOutline from '@iconify/icons-eva/plus-circle-outline';
import minusOutline from '@iconify/icons-eva/minus-circle-outline';

// material
import {
  Card,
  Table,
  Stack,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination
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
import { RepoListHead, RepoListToolbar } from '../components/_dashboard/repos';
import SettingsMoreMenu from '../components/_settings/SettingsMoreMenu';
import SearchNotFound from '../components/SearchNotFound';
import Scrollbar from '../components/Scrollbar';
import Label from '../components/Label';
import Page from '../components/Page';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const ORG_NAME = window.config.REACT_APP_ORG_NAME;

const TABLE_HEAD = [
  { id: 'name', label: 'Language', alignRight: false },
  { id: 'scanningTools', label: 'Scanning Tools', alignRight: false },
  { id: 'supressionFiles', label: 'Supression Files', alignRight: false },
  { id: '' }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_repo) => _repo.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Settings() {
  const [open, setOpen] = React.useState(false);
  const [multipleReposGetToggle, setMultipleReposGetToggle] = useState(false);
  const [multipleArtifactsGetToggle, setMultipleArtifactsGetToggle] = useState(false);
  const [singleReposGetToggle, setSingleReposGetToggle] = useState(false);

  const valueRef = useRef('');

  const handleClickOpen = (param) => (e) => {
    setOpen(true);
    if (param.clickedItem === 'multipleRepos') {
      setMultipleReposGetToggle(true);
    } else if (param.clickedItem === 'multipleLanguages') {
      setMultipleArtifactsGetToggle(true);
    } else if (param.clickedItem === 'singleRepo') {
      setSingleReposGetToggle(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMultipleReposGetToggle(false);
    setMultipleArtifactsGetToggle(false);
    setSingleReposGetToggle(false);
  };

  const handleAgree = () => {
    if (multipleReposGetToggle) {
      getLatestRepoDetails();
    } else if (multipleArtifactsGetToggle) {
      getLatestLanguageDetails();
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
  // async function getLatestLanguageDetails() {
  //   startSpinner();
  //   axiosClient()
  //     .post(`/addLanguages/${ORG_NAME}/${ORG_ID}`)
  //     .then(() => {
  //       console.log('Successfully updated');
  //       stopSpinner();
  //     })
  //     .catch((error) => {
  //       if (error.response.status === 401) {
  //         window.location.reload(false); // reload the page
  //       }
  //     });
  // }

  async function getLanguages() {
    startSpinner();
    axiosClient()
      .get(`/getLanguages/`)
      .then((getData) => {
        // console.log(getData.data);
        setApiData(getData.data);
        stopSpinner();
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

  useEffect(() => {
    getLanguages();
  }, []);

  const getLatestApiData = () => {
    getLanguages();
  };

  let LANGUAGELIST = [];
  LANGUAGELIST = apiData;

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = LANGUAGELIST.map((n) => n.name);
      console.log('newSelecteds');
      console.log(LANGUAGELIST);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - LANGUAGELIST.length) : 0;

  const filteredRepos = applySortFilter(LANGUAGELIST, getComparator(order, orderBy), filterName);

  const isRepoNotFound = filteredRepos.length === 0;

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
                clickedItem: 'multipleLanguages'
              })}
            >
              Get Multiple Languages
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
                      Do You Find Multiple{' '}
                      {(multipleReposGetToggle && <row>Repositories</row>) ||
                        (multipleArtifactsGetToggle && <row>Languages</row>)}{' '}
                      are Missing?
                    </box>
                  )}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-slide-description">
                    {singleReposGetToggle && (
                      <box>
                        Please make sure to enter the correct repository name which is exactly
                        display in Github
                      </box>
                    )}
                    {!singleReposGetToggle && (
                      <box>
                        Please use this if you are certain that multiple{' '}
                        {(multipleReposGetToggle && <row>repositories</row>) ||
                          (multipleArtifactsGetToggle && <row>languages</row>)}{' '}
                        are NOT available in the system. This will take few minutes to complete the
                        process.
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
                  <Button onClick={handleClose}>Disagree</Button>
                  <Button onClick={handleAgree}>Agree</Button>
                </DialogActions>
              </Dialog>
            </div>
          </Stack>
        </Stack>

        <Typography variant="h6" color="green" paddingTop={6} paddingBottom={3}>
          Details of Languages Found in the Organization / Scanning Tools / Suppression Files
        </Typography>

        <Card>
          <RepoListToolbar
            numSelected={selected.length}
            filterName={filterName}
            searchBarText="Search Language..."
            onFilterName={handleFilterByName}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <RepoListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={LANGUAGELIST.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredRepos
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const { id, name, testingTools } = row;
                      const isItemSelected = selected.indexOf(name) !== -1;
                      return (
                        <TableRow
                          hover
                          key={id}
                          tabIndex={-1}
                          role="checkbox"
                          selected={isItemSelected}
                          aria-checked={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={(event) => handleClick(event, name)}
                            />
                          </TableCell>
                          <TableCell component="th" scope="row" padding="normal">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography variant="subtitle2">{name}</Typography>
                            </Stack>
                          </TableCell>

                          {/* scanning tools */}

                          <TableCell align="left">
                            <Stack direction="column" spacing={1}>
                              {testingTools.length !== 0 &&
                                testingTools.map((n) => (
                                  <Button
                                    key={n.id}
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    endIcon={<Icon icon={plusOutline} />}
                                    style={{ justifyContent: 'space-between' }}
                                    // onClick={handleClickOpen({
                                    //   clickedItem: 'add'
                                    // })}
                                  >
                                    {n.toolName}
                                  </Button>
                                ))}
                            </Stack>
                            {testingTools.length === 0 && (
                              <Button
                                size="small"
                                variant="contained"
                                color="warning"
                                disabled
                                endIcon={<Icon icon={plusOutline} />}
                                // onClick={handleClickOpen({
                                //   clickedItem: 'add'
                                // })}
                              >
                                Not Configured
                              </Button>
                            )}
                          </TableCell>

                          {/* supression files */}

                          <TableCell align="left">
                            <Stack direction="column" spacing={1}>
                              {testingTools.length !== 0 &&
                                testingTools.map((n) => (
                                  <Button
                                    key={n.id}
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    endIcon={<Icon icon={minusOutline} />}
                                    style={{ justifyContent: 'space-between' }}
                                    // onClick={handleClickOpen({
                                    //   clickedItem: 'add'
                                    // })}
                                  >
                                    File Name
                                  </Button>
                                ))}
                            </Stack>
                            {testingTools.length === 0 && (
                              <Label variant="filled" color="warning">
                                Not Configured
                              </Label>
                            )}
                          </TableCell>

                          <TableCell align="right">
                            <SettingsMoreMenu
                              getLatestApiData={getLatestApiData}
                              clearApiData={clearApiData}
                              startSpinner={startSpinner}
                              stopSpinner={stopSpinner}
                              id={id}
                              name={name}
                              testingTools={testingTools}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {!loading && isRepoNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
                {loading && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={LANGUAGELIST.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}

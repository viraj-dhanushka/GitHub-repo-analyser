/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable no-template-curly-in-string */



import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import link2Fill from '@iconify/icons-eva/link-2-fill';
import editOutline from '@iconify/icons-eva/edit-2-outline';
import eyeOutline from '@iconify/icons-eva/eye-outline';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';

import {
  Card,
  Box,
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
  TablePagination,
  Link
} from '@mui/material';

import * as React from 'react';
import Modal from '@mui/material/Modal';
import axiosClient from '../utils/axiosInstance';
import { fToNow } from '../utils/formatTime';
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { RepoListHead, RepoListToolbar } from '../components/_dashboard/repos';

// ----------------------------------------------------------------------

const ORG_NAME = window.config.REACT_APP_ORG_NAME;

const COMMIT_TABLE_HEAD = [
  { id: 'prNumber', label: 'PR Number', alignRight: false },
  { id: 'status', label: 'Commit Status', alignRight: false },
  { id: 'commitUrl', label: 'Commit Url', alignRight: false },
  { id: 'pipelines', label: 'Pipelines', alignRight: false },
  { id: '' }
];

const LANGUAGE_TABLE_HEAD = [
  { id: 'language', label: 'Language', alignRight: false },
  { id: 'scanningTools', label: 'Scanning Tools', alignRight: false },
  { id: 'supressionFiles', label: 'Supression Files', alignRight: false },
  { id: '' }
];

const fileContentViewerstyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
};

function descendingComparatorCommits(a, b, orderByCommits) {
  if (b[orderByCommits] < a[orderByCommits]) {
    return -1;
  }
  if (b[orderByCommits] > a[orderByCommits]) {
    return 1;
  }
  return 0;
}

function descendingComparatorLanguages(a, b, orderByLanguages) {
  if (b[orderByLanguages] < a[orderByLanguages]) {
    return -1;
  }
  if (b[orderByLanguages] > a[orderByLanguages]) {
    return 1;
  }
  return 0;
}

function getComparatorCommits(orderCommits, orderByCommits) {
  return orderCommits === 'desc'
    ? (a, b) => descendingComparatorCommits(a, b, orderByCommits)
    : (a, b) => -descendingComparatorCommits(a, b, orderByCommits);
}

function getComparatorLanguages(orderLanguages, orderByLanguages) {
  return orderLanguages === 'desc'
    ? (a, b) => descendingComparatorLanguages(a, b, orderByLanguages)
    : (a, b) => -descendingComparatorLanguages(a, b, orderByLanguages);
}

function applySortFilterCommits(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const orderCommits = comparator(a[0], b[0]);
    if (orderCommits !== 0) return orderCommits;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_commits) => _commits.prUrl.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

function applySortFilterLanguages(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const orderLanguages = comparator(a[0], b[0]);
    if (orderLanguages !== 0) return orderLanguages;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_languages) => _languages.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Repos() {
  const RepoDetails = useLocation();
  const { repoId, createdDate, repoMonitorStatus, orgId, name, watchStatus, repoTag } =
    RepoDetails.state;

  const [fileContentViewerOpen, setFileContentViewerOpen] = React.useState(false);

  const fileContentViewerHandleOpen = () => {
    setFileContentViewerOpen(true);
  };
  const fileContentViewerHandleClose = () => {
    setFileContentViewerOpen(false);
  };

  useEffect(() => {
    startSpinner();
    getLanguages();
  }, []);

  const [overallMonitorStatus, setOverallMonitorStatus] = useState(
    repoMonitorStatus === '1' ? 1 : 0
  );

  const [repoName, setRepoName] = useState(name);
  const [description, setDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [repositoryLanguages, setRepositoryLanguages] = useState([]);
  const [repositoryMonitorStatus, setRepositoryMonitorStatus] = useState('');
  const [repositoryOpenPRs, setRepositoryOpenPRs] = useState([]);
  const [dbUpdatedAt, setDbUpdatedAt] = useState('');

  // TODO: Optimize this calling the api only for the available languages.
  const [languageData, setLanguageData] = useState({});
  const languageDict = {};

  const [loading, setLoading] = useState(false);

  const startSpinner = () => {
    setLoading(true);
  };

  const stopSpinner = () => {
    setLoading(false);
  };

  const updateData = (data) => {
    setRepoName(data.repoName);
    setDescription(data.description);
    setRepoUrl(data.repoUrl);
    setUpdatedAt(data.updatedAt);
    setRepositoryLanguages(data.languages);
    setRepositoryMonitorStatus(data.monitorStatus);
    setRepositoryOpenPRs(data.openPRs);
    setDbUpdatedAt(data.dbUpdatedAt);
  };

  const clearData = () => {
    setRepositoryLanguages([]);
    setRepositoryOpenPRs([]);
  };

  async function getLanguages() {
    axiosClient()
      .get(`/getLanguages/${orgId}`)
      .then((getData) => {
        getData.data.map(createLanDict);
        getCompleteRepoDetailsById(repoId);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.reload(false); // reload the page
        }
      });
  }

  const createLanDict = (langData) => {
    languageDict[langData.id] = langData.testingTools;
    setLanguageData(languageDict);
  };

  async function getCompleteRepoDetailsById(repoId) {
    axiosClient()
      .get(`/getCompleteRepoDetailsById/${orgId}/${repoId}`)
      .then((getData) => {
        updateData(getData.data);
        stopSpinner();
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.reload(false); // reload the page
        }
      });
  }

  const modifyRepositoryInfo = (
    id,
    description,
    dbUpdatedAt,
    languages,
    openPRs,
    orgId,
    repoUrl,
    repoName,
    monitorStatus,
    updatedAt
  ) => {
    axiosClient()
      .put(`/modifyRepositoryInfo`, {
        id,
        description,
        dbUpdatedAt,
        languages,
        openPRs,
        orgId,
        repoUrl,
        repoName,
        monitorStatus,
        updatedAt
      })
      .then(() => {
        getCompleteRepoDetailsById(id);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.reload(false); // reload the page
        }
      });
  };

  const changeMonitorStatusInRepoDetails = () => {
    const monitorStatus = overallMonitorStatus === 1 ? 0 : 1;
    const id = repoId;
    const createdAt = createdDate;
    const repoWatchStatus = watchStatus === '1' ? 1 : 0;
    const tag = repoTag;
    const payLoad = {
      id,
      createdAt,
      monitorStatus,
      orgId,
      repoName,
      repoWatchStatus,
      tag
    };
    // console.log('payload for basic repo: changeMonitorStatus');
    // console.log(payLoad);

    axiosClient()
      .put(`/changeMonitorStatus`, payLoad)
      .then(() => {
        // console.log('payload for basic repo: changeMonitorStatus');
        // console.log(payLoad);
        setOverallMonitorStatus(monitorStatus);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.reload(false); // reload the page
        }
      });
  };

  // update db for selected repo with latest available changes in Github
  const mergeLatestRepositoryInfoToDB = () => {
    startSpinner();
    clearData();
    const id = repoId;
    const monitorStatus = repositoryMonitorStatus === '0' ? 0 : 1;
    // console.log({ id, repoName, monitorStatus });

    // TODO: merge changes to basic repo info container as well (repoName SHOULD be merged there). call this only the name has change. drop otherwise.

    axiosClient()
      .post(`/mergeLatestRepositoryInfoToDB/${ORG_NAME}`, {
        id,
        repoName,
        orgId,
        monitorStatus
      })
      .then(() => {
        console.log('data sent');
        getCompleteRepoDetailsById(id);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.reload(false); // reload the page
        }
      });
  };

  const setPipelineDetails = (param) => (e) => {
    startSpinner();
    clearData();

    let ppMonitorStatus;
    if (param.pipelineMonitorStatus === 1) {
      ppMonitorStatus = 0;
    } else if (param.pipelineMonitorStatus === 0) {
      ppMonitorStatus = 1;
    } else {
      ppMonitorStatus = 1;
    }
    const newElement = {
      context: param.element.context,
      state: param.element.state,
      targetUrl: param.element.targetUrl,
      description: param.element.description,
      pipelineMonitorStatus: ppMonitorStatus
    };

    let newContextArr = [];
    let newPrArr = [];

    // newContextArr - contexts array with latest changes
    newContextArr = param.contextArray.map((item) => (item === param.element ? newElement : item));

    const newPr = param.pr;
    newPr.lastCommit.status.contexts = newContextArr;

    newPrArr = repositoryOpenPRs.map((item) => (item === param.pr ? newPr : item));

    modifyRepositoryInfo(
      repoId,
      description,
      dbUpdatedAt,
      repositoryLanguages,
      newPrArr,
      orgId,
      repoUrl,
      repoName,
      ppMonitorStatus,
      updatedAt
    );
  };

  const [pageCommits, setPageCommits] = useState(0);
  const [orderCommits, setOrderCommits] = useState('asc');
  const [selectedCommits, setSelectedCommits] = useState([]);
  const [orderByCommits, setOrderByCommits] = useState('prNumber');
  const [filterNameCommits, setFilterNameCommits] = useState('');
  const [rowsPerPageCommits, setRowsPerPageCommits] = useState(5);

  const [pageLanguages, setPageLanguages] = useState(0);
  const [orderLanguages, setOrderLanguages] = useState('asc');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [orderByLanguages, setOrderByLanguages] = useState('language');
  const [filterNameLanguages, setFilterNameLanguages] = useState('');
  const [rowsPerPageLanguages, setRowsPerPageLanguages] = useState(5);

  const handleCommitsRequestSort = (event, property) => {
    const isAsc = orderByCommits === property && orderCommits === 'asc';
    setOrderCommits(isAsc ? 'desc' : 'asc');
    setOrderByCommits(property);
  };

  const handleLanguagesRequestSort = (event, property) => {
    const isAsc = orderByLanguages === property && orderLanguages === 'asc';
    setOrderLanguages(isAsc ? 'desc' : 'asc');
    setOrderByLanguages(property);
  };

  const handleCommitSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = repositoryOpenPRs.map((n) => n.prNumber);
      setSelectedCommits(newSelecteds);
      return;
    }
    setSelectedCommits([]);
  };

  const handleLanguageSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = repositoryLanguages.map((n) => n.name);
      setSelectedLanguages(newSelecteds);
      return;
    }
    setSelectedLanguages([]);
  };

  const handleCommitsClick = (event, prNumber) => {
    const selectedIndex = selectedCommits.indexOf(prNumber);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedCommits, prNumber);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedCommits.slice(1));
    } else if (selectedIndex === selectedCommits.length - 1) {
      newSelected = newSelected.concat(selectedCommits.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedCommits.slice(0, selectedIndex),
        selectedCommits.slice(selectedIndex + 1)
      );
    }
    setSelectedCommits(newSelected);
  };

  const handleLanguagesClick = (event, language) => {
    const selectedIndex = selectedLanguages.indexOf(language);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedLanguages, language);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedLanguages.slice(1));
    } else if (selectedIndex === selectedLanguages.length - 1) {
      newSelected = newSelected.concat(selectedLanguages.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedLanguages.slice(0, selectedIndex),
        selectedLanguages.slice(selectedIndex + 1)
      );
    }
    setSelectedLanguages(newSelected);
  };

  const handleCommitsChangePage = (event, newPage) => {
    setPageCommits(newPage);
  };

  const handleLanguagesChangePage = (event, newPage) => {
    setPageLanguages(newPage);
  };

  const handleCommitsChangeRowsPerPage = (event) => {
    setRowsPerPageCommits(parseInt(event.target.value, 10));
    setPageCommits(0);
  };

  const handleLanguagesChangeRowsPerPage = (event) => {
    setRowsPerPageLanguages(parseInt(event.target.value, 10));
    setPageLanguages(0);
  };

  const handleCommitsFilterByName = (event) => {
    setFilterNameCommits(event.target.value);
  };

  const handleLanguagesFilterByName = (event) => {
    setFilterNameLanguages(event.target.value);
  };

  const emptyRowsCommits =
    pageCommits > 0
      ? Math.max(0, (1 + pageCommits) * rowsPerPageCommits - repositoryOpenPRs.length)
      : 0;

  const emptyRowsLanguages =
    pageLanguages > 0
      ? Math.max(0, (1 + pageLanguages) * rowsPerPageLanguages - repositoryLanguages.length)
      : 0;

  const filteredCommits = applySortFilterCommits(
    repositoryOpenPRs,
    getComparatorCommits(orderCommits, orderByCommits),
    filterNameCommits
  );

  const filteredLanguages = applySortFilterLanguages(
    repositoryLanguages,
    getComparatorLanguages(orderLanguages, orderByLanguages),
    filterNameLanguages
  );

  const isCommitNotFound = filteredCommits.length === 0;

  const isLanguageNotFound = filteredLanguages.length === 0;

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
              {repoName}
            </Typography>

            <Typography variant="body1" color="blue" gutterBottom>
              {description}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-even"
              spacing={2}
              mb={5}
            >
              <Typography variant="body2">
                <span>🕓</span> repo created {fToNow(createdDate)} <span>🕓</span> repo last updated{' '}
                <Box fontWeight="fontWeightMedium" display="inline">
                  {fToNow(updatedAt)}
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
              href={repoUrl}
            >
              Visit Repo
            </Button>
            {/* <Box fontWeight="fontWeightMedium" fontSize={12} display="inline">
              Supression Files ?{' '}
              <Button
                size="small"
                variant="contained"
                color={overallMonitorStatus === 0 ? 'success' : 'error'}
                onClick={changeMonitorStatusInRepoDetails}
              >
                {overallMonitorStatus === 0 ? 'No' : 'Yes'}
              </Button>
            </Box> */}
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" color="green" sx={{ mb: 2 }}>
            Details of Last Commit in all OPEN PRs
          </Typography>
          <Typography variant="body2">
            ( <span>🕓 </span>details last checked{' '}
            <Box fontWeight="fontWeightMedium" display="inline">
              {fToNow(dbUpdatedAt)}
            </Box>{' '}
            .{' '}
            <Button size="small" variant="text" onClick={mergeLatestRepositoryInfoToDB}>
              Click here to get latest updates.
            </Button>{' '}
            )
          </Typography>
        </Stack>
        <Card>
          <RepoListToolbar
            numSelected={selectedCommits.length}
            filterNameCommits={filterNameCommits}
            searchBarText="Search PR Number, URL..."
            onFilterName={handleCommitsFilterByName}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <RepoListHead
                  orderCommits={orderCommits}
                  orderByCommits={orderByCommits}
                  headLabel={COMMIT_TABLE_HEAD}
                  rowCount={repositoryOpenPRs.length}
                  numSelected={selectedCommits.length}
                  onRequestSort={handleCommitsRequestSort}
                  onSelectAllClick={handleCommitSelectAllClick}
                />
                <TableBody>
                  {filteredCommits
                    .slice(
                      pageCommits * rowsPerPageCommits,
                      pageCommits * rowsPerPageCommits + rowsPerPageCommits
                    )
                    .map((row) => {
                      const { prNumber, prUrl, lastCommit } = row;
                      const isItemSelected = selectedCommits.indexOf(prNumber) !== -1;

                      return (
                        <TableRow
                          hover
                          key={prNumber}
                          tabIndex={-1}
                          role="checkbox"
                          selectedCommits={isItemSelected}
                          aria-checked={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={(event) => handleCommitsClick(event, prNumber)}
                            />
                          </TableCell>
                          <TableCell align="left">
                            <Typography
                              variant="subtitle2"
                              noWrap
                              component={Link}
                              target="_blank"
                              href={prUrl}
                            >
                              {prNumber}
                            </Typography>
                          </TableCell>

                          <TableCell align="left">
                            <Label
                              variant="ghost"
                              color={
                                (lastCommit.status != null &&
                                  lastCommit.status.state === 'SUCCESS' &&
                                  'success') ||
                                (lastCommit.status != null &&
                                  lastCommit.status.state === 'FAILURE' &&
                                  'error') ||
                                'warning'
                              }
                            >
                              {lastCommit.status == null ? 'NULL' : lastCommit.status.state}
                            </Label>
                          </TableCell>

                          <TableCell align="left">
                            <Button
                              variant="contained"
                              startIcon={<Icon icon={link2Fill} />}
                              component={Link}
                              target="_blank"
                              href={lastCommit.commitUrl}
                            >
                              Visit
                            </Button>
                          </TableCell>

                          {lastCommit.status != null && (
                            <TableCell align="left">
                              {lastCommit.status.contexts.map((el, index) => (
                                <Stack
                                  direction="column"
                                  alignItems="left"
                                  justifyContent="left"
                                  mb={5}
                                  key={index}
                                >
                                  <Typography variant="body1" gutterBottom color="brown">
                                    Context: {el.context}
                                  </Typography>
                                  <Typography variant="body1" gutterBottom color="blue">
                                    Description: {el.description}
                                  </Typography>
                                  <Typography variant="subtitle1" gutterBottom>
                                    State: {el.state}
                                  </Typography>
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-even"
                                    spacing={2}
                                    mb={5}
                                  >
                                    <Button
                                      variant="contained"
                                      startIcon={<Icon icon={link2Fill} />}
                                      component={Link}
                                      target="_blank"
                                      href={el.targetUrl}
                                    >
                                      Visit Pipeline
                                    </Button>
                                    <Button
                                      variant="contained"
                                      startIcon={<Icon icon={editOutline} />}
                                      color={el.pipelineMonitorStatus === 1 ? 'success' : 'error'}
                                      onClick={setPipelineDetails({
                                        pr: row,
                                        contextArray: lastCommit.status.contexts,
                                        element: el,
                                        pipelineMonitorStatus: el.pipelineMonitorStatus
                                      })}
                                    >
                                      {el.pipelineMonitorStatus === 1 ? 'Monitor' : 'Ignore'}
                                    </Button>
                                  </Stack>
                                </Stack>
                              ))}
                            </TableCell>
                          )}
                          {lastCommit.status == null && (
                            <TableCell>
                              <Typography variant="body1" gutterBottom>
                                NULL
                              </Typography>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  {emptyRowsCommits > 0 && (
                    <TableRow style={{ height: 53 * emptyRowsCommits }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {!loading && isCommitNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterNameCommits} />
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
            count={repositoryOpenPRs.length}
            rowsPerPage={rowsPerPageCommits}
            page={pageCommits}
            onPageChange={handleCommitsChangePage}
            onRowsPerPageChange={handleCommitsChangeRowsPerPage}
          />
        </Card>

        {/* languages--------------------------------------------- */}
        <Typography variant="h6" color="green" paddingTop={6} paddingBottom={3}>
          Details of Languages Found in the Repo / Configured Scanning Tools / Suppression Files
        </Typography>
        <Card>
          <RepoListToolbar
            numSelected={selectedLanguages.length}
            filterNameLanguages={filterNameLanguages}
            searchBarText="Search Languages..."
            onFilterName={handleLanguagesFilterByName}
          />
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <RepoListHead
                  orderLanguages={orderLanguages}
                  orderByLanguages={orderByLanguages}
                  headLabel={LANGUAGE_TABLE_HEAD}
                  rowCount={repositoryLanguages.length}
                  numSelected={selectedLanguages.length}
                  onRequestSort={handleLanguagesRequestSort}
                  onSelectAllClick={handleLanguageSelectAllClick}
                />
                <TableBody>
                  {filteredLanguages
                    .slice(
                      pageLanguages * rowsPerPageLanguages,
                      pageLanguages * rowsPerPageLanguages + rowsPerPageLanguages
                    )
                    .map((row) => {
                      const { name, id, color } = row;
                      const isItemSelected = selectedLanguages.indexOf(name) !== -1;

                      return (
                        <TableRow
                          hover
                          key={id}
                          tabIndex={-1}
                          role="checkbox"
                          selectedLanguages={isItemSelected}
                          aria-checked={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={(event) => handleLanguagesClick(event, name)}
                            />
                          </TableCell>
                          <TableCell align="left">
                            <Typography variant="subtitle2" noWrap color={color}>
                              {name}
                            </Typography>
                          </TableCell>

                          {/* scanning tools */}

                          <TableCell align="left">
                            <Stack direction="row" spacing={1}>
                              {Array.isArray(languageData[id]) && languageData[id].length !== 0 ? (
                                languageData[id].map((n) => (
                                  <Label variant="filled" color="default" key={n.id}>
                                    {n.toolName}
                                  </Label>
                                ))
                              ) : (
                                <Label variant="filled" color="warning">
                                  Not Configured
                                </Label>
                              )}
                            </Stack>
                          </TableCell>

                          {/* supression files */}

                          <TableCell align="left">
                            <Stack direction="row" spacing={1}>
                              {Array.isArray(languageData[id]) && languageData[id].length !== 0 ? (
                                languageData[id].map((n) => (
                                  <Button
                                    key={n.id}
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    startIcon={<Icon icon={eyeOutline} />}
                                    style={{ justifyContent: 'space-between' }}
                                    onClick={fileContentViewerHandleOpen}
                                  >
                                    File Name
                                  </Button>
                                ))
                              ) : (
                                <Label variant="filled" color="warning">
                                  Not Configured
                                </Label>
                              )}
                            </Stack>
                          </TableCell>

                          <TableCell align="left">
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<Icon icon={link2Fill} />}
                              component={RouterLink}
                              to="/dashboard/settings"
                            >
                              Configure Scanning Tools
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {emptyRowsLanguages > 0 && (
                    <TableRow style={{ height: 53 * emptyRowsLanguages }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {!loading && isLanguageNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterNameLanguages} />
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
            count={repositoryLanguages.length}
            rowsPerPage={rowsPerPageLanguages}
            page={pageLanguages}
            onPageChange={handleLanguagesChangePage}
            onRowsPerPageChange={handleLanguagesChangeRowsPerPage}
          />
        </Card>
        <div>
          <Modal
            open={fileContentViewerOpen}
            onClose={fileContentViewerHandleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={fileContentViewerstyle}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Content in the Suppression File
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2, mb: 2 }}>
                <Box>
                  {' '}
                  Selected code repositories (GitHub) have static code scanning enabled for both
                  application and Infrastructure as code. This application will primarily be used to
                  perform the following tasks related to such repositories, branches, and associated
                  build pipelines:{' '}
                </Box>
                Monitor SAST pipelines for security failures Monitor IaC pipelines for security
                failures Monitor entries added to suppression file/annotation of code repositories
                (providing security teams an auditable view across all current security issue
                suppressions) Monitor branch create/delete actions, and update pipeline security
                configurations accordingly In addition to that, the application should contain the
                following monitoring widgets, created using the data retrieved: Number of builds
                failed due to security issues Releases with security exceptions/bypasses Security
                issues reported for each repository Time taken to fix security issues Listing of
                third party dependencies used in projects and summary of last scan results Basic
                detections related to anomalies in code commits (no machine learning involved at
                this stage)
              </Typography>
              <Button
                variant="contained"
                startIcon={<Icon icon={link2Fill} />}
                component={Link}
                target="_blank"
                // href={}
              >
                Visit File
              </Button>
            </Box>
          </Modal>
        </div>
      </Container>
    </Page>
  );
}

/* eslint-disable prettier/prettier */
/* eslint-disable no-template-curly-in-string */


import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import link2Fill from '@iconify/icons-eva/link-2-outline';
import { Link as RouterLink } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
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
  TablePagination,
  Link
} from '@mui/material';
import axiosClient from '../utils/axiosInstance';
import { fDate } from '../utils/formatTime';
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { RepoListHead, RepoListToolbar, RepoMoreMenu } from '../components/_dashboard/repos';

// ----------------------------------------------------------------------

const ORG_NAME = window.config.REACT_APP_ORG_NAME;
const ORG_DISP_NAME = window.config.REACT_APP_ORG_DISP_NAME;

const TABLE_HEAD = [
  { id: 'repoName', label: 'Name', alignRight: false },
  { id: 'createdAt', label: 'Created Date', alignRight: false },
  { id: 'repoUrl', label: 'Repo URL', alignRight: false },
  { id: 'tag', label: 'Tag', alignRight: false },
  { id: 'repoWatchStatus', label: 'State', alignRight: false },
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
    return filter(
      array,
      (_repo) => _repo.repoName.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function NonFavouriteRepos() {
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

  const getLatestApiData = () => {
    getNonWatchRepos(localStorage.getItem('currentTag'));
  };

  async function getNonWatchRepos(tagName) {
    startSpinner();
    axiosClient()
      .get(`/getNonWatchingRepos/${tagName}`)
      .then((getData) => {
        console.log(getData.data);
        setApiData(getData.data);
        stopSpinner();
      })
      .catch((error) => {
        if (error.response.status === 401) {
          window.location.reload(false); // reload the page
        }
      });
  }

  useEffect(() => {
    getNonWatchRepos(localStorage.getItem('currentTag'));
    // console.log('add');
    document.addEventListener('selectTag', handleSelectTag, false);
    return () => {
      // console.log('remove');
      document.removeEventListener('selectTag', handleSelectTag, false);
    };
  }, []);

  const handleSelectTag = (e) => {
    clearApiData();
    getNonWatchRepos(e.detail);
  };

  let REPOLIST = [];
  REPOLIST = apiData;

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('repoName');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = REPOLIST.map((n) => n.repoName);
      console.log('newSelecteds');
      console.log(REPOLIST);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, repoName) => {
    const selectedIndex = selected.indexOf(repoName);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, repoName);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - REPOLIST.length) : 0;

  const filteredRepos = applySortFilter(REPOLIST, getComparator(order, orderBy), filterName);

  const isRepoNotFound = filteredRepos.length === 0;

  return (
    <Page title="Non Watching Repos | Repo Analyser">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Non Watching Repositories
          </Typography>
          <Button
            variant="contained"
            startIcon={<Icon icon={link2Fill} />}
            component={Link}
            target="_blank"
            href={`https://github.com/${ORG_NAME}`}
          >
            {ORG_DISP_NAME}
          </Button>
        </Stack>

        <Card>
          <RepoListToolbar
            numSelected={selected.length}
            filterName={filterName}
            searchBarText="Search Repository..."
            onFilterName={handleFilterByName}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <RepoListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={REPOLIST.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredRepos
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const { id, createdAt, description, repoUrl, repoWatchStatus, repoName, tag } = row;
                      const isItemSelected = selected.indexOf(repoName) !== -1;

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
                              onChange={(event) => handleClick(event, repoName)}
                            />
                          </TableCell>
                          <TableCell align="left">
                            <Typography
                              variant="subtitle2"
                              noWrap
                              component={RouterLink}
                              to="/dashboard/repo"
                              state={{
                                repoId: id,
                                reprDescrption: description,
                                createdDate: createdAt,
                                repoLink: repoUrl,
                                name: repoName,
                                watchStatus: repoWatchStatus,
                                repoTag: tag
                              }}
                            >
                              {repoName}
                            </Typography>
                          </TableCell>

                          <TableCell align="left">{fDate(createdAt)}</TableCell>

                          <TableCell align="left">
                            <Button
                              startIcon={<Icon icon={link2Fill} />}
                              component={Link}
                              target="_blank"
                              href={repoUrl}
                            >
                              Link
                            </Button>
                          </TableCell>

                          <TableCell align="left">
                            <Label
                              variant="ghost"
                              color={(tag === 'Not Specified' && 'warning') || 'default'}
                            >
                              {tag}
                            </Label>
                          </TableCell>

                          <TableCell align="left">
                            <Label
                              variant="ghost"
                              color={(repoWatchStatus === 0 && 'error') || 'success'}
                            >
                              {repoWatchStatus === 1 ? 'Watch' : 'Unwatch'}
                            </Label>
                          </TableCell>

                          <TableCell align="right">
                            <RepoMoreMenu
                              getLatestApiData={getLatestApiData}
                              clearApiData={clearApiData}
                              startSpinner={startSpinner}
                              id={id}
                              createdAt={createdAt}
                              repoName={repoName}
                              repoWatchStatus={repoWatchStatus}
                              tag={tag}
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
            count={REPOLIST.length}
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

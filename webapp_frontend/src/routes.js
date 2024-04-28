/* eslint-disable prettier/prettier */


import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import DashboardApp from './pages/DashboardApp';
import AllRepos from './pages/AllRepos';
import FavouriteRepos from './pages/FavouriteRepos';
import NonFavouriteRepos from './pages/NonFavouriteRepos';
import NotFound from './pages/Page404';
import Repo from './pages/Repo';
import Settings from './pages/Settings';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" replace /> },
        { path: 'app', element: <DashboardApp /> },
        { path: 'allRepos', element: <AllRepos /> },
        { path: 'favouriteRepos', element: <FavouriteRepos /> },
        { path: 'nonFavouriteRepos', element: <NonFavouriteRepos /> },
        { path: 'repo', element: <Repo /> },
        { path: 'settings', element: <Settings /> }
      ]
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { path: '404', element: <NotFound /> },
        { path: '/', element: <Navigate to="/dashboard/app" /> },
        { path: '*', element: <Navigate to="/404" /> }
      ]
    },
    // { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}

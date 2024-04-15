/* eslint-disable prettier/prettier */


import { Icon } from '@iconify/react';
import pieChart2Fill from '@iconify/icons-eva/pie-chart-2-fill';
import shoppingBagFill from '@iconify/icons-eva/shopping-bag-fill';
import fileTextFill from '@iconify/icons-eva/file-text-fill';
import alertTriangleFill from '@iconify/icons-eva/alert-triangle-fill';

// ----------------------------------------------------------------------

const getIcon = (name) => <Icon icon={name} width={22} height={22} />;

const sidebarConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: getIcon(pieChart2Fill)
  },
  {
    title: 'all Repos',
    path: '/dashboard/allRepos',
    icon: getIcon(shoppingBagFill)
  },
  {
    title: 'watching Repos',
    path: '/dashboard/watchingRepos',
    icon: getIcon(fileTextFill)
  },
  {
    title: 'non Watching Repos',
    path: '/dashboard/nonWatchingRepos',
    icon: getIcon(alertTriangleFill)
  }
];

export default sidebarConfig;

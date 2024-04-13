/* eslint-disable prettier/prettier */
/* eslint-disable no-restricted-globals */


import { format, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

export function fDate(timestamp) {
  const date = new Date(timestamp);
  if (isNaN(date.getDate())) {
    return 'Not Available';
  }
  return format(date, 'dd MMMM yyyy');
}

export function fDateBasic(timestamp) {
  const date = new Date(timestamp);
  if (isNaN(date.getDate())) {
    return 'Not Available';
  }
  return `${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

export function fDateTime(timestamp) {
  const date = new Date(timestamp);
  if (isNaN(date.getDate())) {
    return 'Not Available';
  }
  return format(date, 'dd MMM yyyy p');
}

export function fDateTimeSuffix(timestamp) {
  const date = new Date(timestamp);
  if (isNaN(date.getDate())) {
    return 'Not Available';
  }
  return format(date, 'dd/MM/yyyy hh:mm p');
}

export function fToNow(timestamp) {
  const date = new Date(timestamp);
  if (isNaN(date.getDate())) {
    return 'Not Available';
  }
  return formatDistanceToNow(date, {
    addSuffix: true
  });
}

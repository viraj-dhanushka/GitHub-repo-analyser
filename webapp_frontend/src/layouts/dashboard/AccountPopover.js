/* eslint-disable prettier/prettier */

import { Icon } from '@iconify/react';
import React, { useRef, useState, useEffect } from 'react';
import homeFill from '@iconify/icons-eva/home-fill';
import personFill from '@iconify/icons-eva/person-fill';
import settings2Fill from '@iconify/icons-eva/settings-2-fill';
import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { Button, Box, Divider, MenuItem, Typography, Avatar, IconButton } from '@mui/material';
import { useAuthContext } from "@asgardeo/auth-react";
import MenuPopover from '../../components/MenuPopover';
import account from '../../_mocks_/account';
// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: homeFill,
    linkTo: '/'
  },
  // {
  //   label: 'Profile',
  //   icon: personFill,
  //   linkTo: '#'
  // },
  {
    label: 'Settings',
    icon: settings2Fill,
    linkTo: '/dashboard/settings'
  }
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const { state, getBasicUserInfo, signOut } = useAuthContext();

  const [username, setUsername] = useState(null);
  const [name, setName] = useState(null);

  // const setIsInitLogin = (value) => {
  //   sessionStorage.setItem('isInitLogin', value);
  // };

  // function handleLogout(instance) {
  //   setOpen(false);
  //   setIsInitLogin('false');
  //   instance.logoutRedirect().catch((e) => {
  //     setIsInitLogin('true');
  //     console.error(e);
  //   });
  // }
  useEffect(() => {
    if (state.isAuthenticated) {
      setName(getBasicUserInfo.name);
      setUsername(getBasicUserInfo.username);
        // console.log(response);

    }
  }, [getBasicUserInfo.name, getBasicUserInfo.username, state.isAuthenticated]);

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72)
            }
          })
        }}
      >
        <Avatar src={account.photoURL} alt="photoURL" />
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 220 }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle1" noWrap>
            {name == null ? '' : name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {username == null ? '' : username}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {MENU_OPTIONS.map((option) => (
          <MenuItem
            key={option.label}
            to={option.linkTo}
            component={RouterLink}
            onClick={handleClose}
            sx={{ typography: 'body2', py: 1, px: 2.5 }}
          >
            <Box
              component={Icon}
              icon={option.icon}
              sx={{
                mr: 2,
                width: 24,
                height: 24
              }}
            />

            {option.label}
          </MenuItem>
        ))}

        <Box sx={{ p: 2, pt: 1.5 }}>
          {/* <Button fullWidth color="inherit" variant="outlined"> */}
          <Button
            fullWidth
            color="inherit"
            variant="outlined"
            onClick={() =>signOut()}
          >
            Logout
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}
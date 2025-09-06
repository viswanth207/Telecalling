import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AuthContext from '../../context/AuthContext';
import setAuthToken from '../../utils/setAuthToken';

const Navbar = () => {
  const { isAuthenticated, user, setIsAuthenticated, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(false);
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  const authLinks = (
    <>
      {user && user.role === 'lead' ? (
        <Button color="inherit" component={Link} to="/lead-dashboard">
          Dashboard
        </Button>
      ) : (
        <Button color="inherit" component={Link} to="/dashboard">
          Dashboard
        </Button>
      )}
      {user && user.role !== 'lead' && (
        <Button color="inherit" component={Link} to="/leads">
          Students
        </Button>
      )}

      <Button color="inherit" onClick={onLogout}>
        Logout
      </Button>
    </>
  );

  const guestLinks = (
    <>
      <Button color="inherit" component={Link} to="/login">
        Login
      </Button>
    </>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => { handleClose(); navigate('/'); }}>
              Home
            </MenuItem>
            {isAuthenticated && (
              <MenuItem onClick={() => { handleClose(); navigate('/dashboard'); }}>
                Dashboard
              </MenuItem>
            )}
            {isAuthenticated && (
              <MenuItem onClick={() => { handleClose(); navigate('/leads'); }}>
                Students
              </MenuItem>
            )}

            {isAuthenticated && user && user.role === 'admin' && (
              <MenuItem onClick={() => { handleClose(); navigate('/upload-leads'); }}>
                Upload Students
              </MenuItem>
            )}
            {isAuthenticated && (
              <MenuItem onClick={() => { handleClose(); navigate('/add-lead'); }}>
                Add Student
              </MenuItem>
            )}
          </Menu>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              Vignan Telecalling
            </Link>
          </Typography>
          {isAuthenticated ? authLinks : guestLinks}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
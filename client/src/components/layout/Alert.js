import React, { useContext } from 'react';
import AlertContext from '../../context/AlertContext';
import { Alert as MuiAlert, Stack } from '@mui/material';

const Alert = () => {
  const { alerts } = useContext(AlertContext);

  return (
    <Stack sx={{ width: '100%', position: 'fixed', top: 70, zIndex: 9999 }} spacing={2}>
      {alerts.length > 0 &&
        alerts.map(alert => (
          <MuiAlert 
            key={alert.id} 
            severity={alert.alertType} 
            sx={{ width: '80%', margin: '0 auto' }}
          >
            {alert.msg}
          </MuiAlert>
        ))}
    </Stack>
  );
};

export default Alert;
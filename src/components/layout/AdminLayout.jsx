import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Topbar />

      <Box
        component="main"
        sx={{
          ml: { md: `${DRAWER_WIDTH}px` },
          pt: '180px',
          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            maxWidth: 1900,
            mx: 'auto',
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
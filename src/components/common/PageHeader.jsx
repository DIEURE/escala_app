import { Box, Typography } from '@mui/material';

export default function PageHeader({ title, description, action }) {
  return (
    <Box
      sx={{
        mb: 4,
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {title}
        </Typography>

        {description && (
          <Typography color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>

      {action}
    </Box>
  );
}
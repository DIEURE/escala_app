import { Box, Paper, Typography } from '@mui/material';

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'primary.main',
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>

          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mt: 1, lineHeight: 1.1 }}
          >
            {value}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 46,
            height: 46,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            borderRadius: 2,
            bgcolor: color,
            color: '#FFFFFF',
          }}
        >
          {icon}
        </Box>
      </Box>

      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 2 }}
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Container, Typography } from '@mui/material';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Container sx={{ mt: 8 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography color="text.secondary">Welcome to SocialSync.</Typography>
      </Container>
    </ProtectedRoute>
  );
}


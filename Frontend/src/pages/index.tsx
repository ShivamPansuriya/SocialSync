import { Box, Button, Container, Typography } from '@mui/material';
import Link from 'next/link';
import styles from '@/styles/landing.module.css';

export default function HomePage() {
  return (
    <Container maxWidth="lg">
      <Box className={styles.hero}>
        <Typography variant="h2" component="h1" gutterBottom>
          Manage Social Media Like a Pro
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Connect accounts, create posts, schedule content, and analyze performance in one place.
        </Typography>
        <Box display="flex" gap={2}>
          <Link href="/login" passHref>
            <Button variant="contained" size="large">Get Started</Button>
          </Link>
          <Link href="/about" passHref>
            <Button variant="outlined" size="large">Learn More</Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}


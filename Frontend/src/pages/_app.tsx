import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useState } from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';

// Simple theme; can be extended with dark mode and brand colors
const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#1976d2' } },
  typography: { fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif' },
});

// Global app context placeholder (add auth, settings later)
export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Head>
          <title>SocialSync</title>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}


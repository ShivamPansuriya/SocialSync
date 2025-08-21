import axios from 'axios';

// API service abstraction; base URL from env for flexibility across environments
// NEXT_PUBLIC_API_BASE_URL is used at build/runtime by Next.js
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  withCredentials: true,
});


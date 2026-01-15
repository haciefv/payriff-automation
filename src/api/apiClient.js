import axios from 'axios';
import { env } from '../config/env.js';

export const api = axios.create({
  baseURL: env.apiUrl || undefined,
  timeout: 30_000,
});

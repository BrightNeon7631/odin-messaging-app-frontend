import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import axios from 'axios';

axios.defaults.baseURL =
  import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

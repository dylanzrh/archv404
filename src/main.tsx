import React from 'react';
import ReactDOM from 'react-dom/client';
import Preview from './Preview';
import { inject } from '@vercel/analytics';

// Enable Vercel Web Analytics
inject();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Preview />
  </React.StrictMode>
);

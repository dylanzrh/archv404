import React from 'react';
import ReactDOM from 'react-dom/client';
import Preview from './Preview';
import { Analytics } from '@vercel/analytics/react';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Preview />
    <Analytics />
  </React.StrictMode>
);

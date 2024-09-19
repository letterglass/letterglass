import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.scss';
import { TRPC, TRPCClient } from '$api';
import { App } from './App.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TRPC.Provider client={TRPCClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </TRPC.Provider>
  </React.StrictMode>,
);

postMessage({ payload: 'removeLoading' }, '*');

// Prevent zoom.
document.addEventListener(
  'touchmove',
  (event: any) => {
    event = event.originalEvent || event;
    if (typeof event.scale !== 'undefined' && event.scale !== 1) {
      event.preventDefault();
    }
  },
  { passive: false },
);

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global resilience handlers for benign browser sandbox aborts and cross-origin events
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = (reason && (reason.message || reason.name || String(reason))) || '';
    if (
      msg.includes('aborted') ||
      msg.includes('AbortError') ||
      msg.includes('user aborted a request') ||
      msg.includes('Cannot set property fetch')
    ) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg === 'Script error.' ||
      msg.includes('user aborted a request') ||
      msg.includes('Cannot set property fetch')
    ) {
      // Suppress cross-origin opaque script error and benign aborts from bubbling
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

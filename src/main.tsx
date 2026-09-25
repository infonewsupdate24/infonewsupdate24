import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PWAService } from './services/PWAService';
import { getPublishedHomepage, loadPublishedHomepage } from './services/PublishedHomepage';
import { HomepageSyncNotice } from './components/HomepageSyncNotice';

// Initialize PWA install prompt listeners immediately on startup
PWAService.init();

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

async function start() {
  if (!getPublishedHomepage() && !/^\/(cms|admin|login|press-card-admin|verify-card|verify-reporter)(\/|$)/.test(location.pathname)) {
    try { await loadPublishedHomepage(); } catch (error) { console.warn(error); }
  }
  createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <HomepageSyncNotice />
  </StrictMode>,
);
}
void start();

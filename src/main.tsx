import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Catch and gracefully handle MetaMask or wallet extension errors inside sandboxed preview iframes
if (typeof window !== 'undefined') {
  const isExtensionError = (message: string) => {
    const msg = message.toLowerCase();
    return (
      msg.includes('metamask') ||
      msg.includes('ethereum') ||
      msg.includes('wallet') ||
      msg.includes('rpc') ||
      msg.includes('contentdocument')
    );
  };

  window.addEventListener('error', (event) => {
    if (event.message && isExtensionError(event.message)) {
      console.warn('[MetaMask Shield] Intercepted and neutralized sandboxed browser extension/wallet error:', event.message);
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = reason?.message || String(reason || '');
    if (isExtensionError(msg)) {
      console.warn('[MetaMask Shield] Intercepted and neutralized unhandled extension or wallet promise rejection:', msg);
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

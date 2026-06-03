import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Catch and gracefully handle MetaMask or wallet extension errors inside sandboxed preview iframes
if (typeof window !== 'undefined') {
  // Provide a safe placeholder ethereum provider so browser extensions do not throw connection exceptions in the sandboxed frame
  if (!(window as any).ethereum) {
    try {
      (window as any).ethereum = {
        isMetaMask: true,
        isSandboxMock: true,
        request: async (args: any) => {
          console.info('[MetaMask Sandbox Mock] Neutralized request in secure offline workstation:', args?.method);
          if (args?.method === 'eth_accounts' || args?.method === 'eth_requestAccounts') {
            return [];
          }
          return null;
        },
        on: () => {},
        removeListener: () => {},
        enable: async () => [],
        autoRefreshOnNetworkChange: false,
      };
    } catch (e) {
      console.warn('[MetaMask Shield] Failed to define mock ethereum provider:', e);
    }
  }

  const isExtensionError = (message: string) => {
    const msg = String(message || '').toLowerCase();
    return (
      msg.includes('metamask') ||
      msg.includes('ethereum') ||
      msg.includes('wallet') ||
      msg.includes('rpc') ||
      msg.includes('contentdocument') ||
      msg.includes('extension') ||
      msg.includes('failed to connect')
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

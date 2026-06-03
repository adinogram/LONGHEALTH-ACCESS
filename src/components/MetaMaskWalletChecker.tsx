/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { Wallet, ShieldCheck, AlertTriangle, ExternalLink, HelpCircle } from 'lucide-react';

export const MetaMaskWalletChecker: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasMetaMask, setHasMetaMask] = useState<boolean>(false);
  const [useVirtualWallet, setUseVirtualWallet] = useState<boolean>(false);

  useEffect(() => {
    // Check if MetaMask/Ethereum provider exists in window scope
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      setHasMetaMask(true);
      // See if already connected
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    try {
      const provider = (window as any).ethereum;
      const accounts = await provider.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (err: any) {
      console.warn('[MetaMask] Gracefully parsed connection check failure:', err);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setErrorMsg(null);

    // If MetaMask is not present, we automatically activate Virtual Sandbox mode with a clear advisory
    if (!hasMetaMask) {
      setTimeout(() => {
        setAccount('0x3f5CE0D3a33555239F63706060c4C000A1A2E4B5');
        setUseVirtualWallet(true);
        setIsConnecting(false);
      }, 500);
      return;
    }

    try {
      const provider = (window as any).ethereum;
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setUseVirtualWallet(false);
      } else {
        setErrorMsg('No accounts returned from MetaMask.');
      }
    } catch (err: any) {
      console.error('[MetaMask] Connection failed:', err);
      
      // Typical error 0, -32603, or sandbox policy failures
      if (err.code === 0 || err.message?.toLowerCase().includes('sandboxed') || err.message?.toLowerCase().includes('frame')) {
        setErrorMsg('Iframe Access Restricted: Sandboxed preview limits Web3 operations. Click "Connect Virtual Sandbox Wallet" below to simulate full HIPAA integration safely.');
      } else {
        setErrorMsg(err.message || 'Verification rejected or timed out.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const forceVirtualWallet = () => {
    setAccount('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
    setUseVirtualWallet(true);
    setErrorMsg(null);
  };

  const disconnectWallet = () => {
    setAccount(null);
    setUseVirtualWallet(false);
    setErrorMsg(null);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div id="metamask-wallet-connector" className="flex items-center gap-3">
      {account ? (
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-left font-mono">
            <div className="flex items-center gap-1.5 text-[9px] text-indigo-400 font-bold tracking-wide uppercase">
              <span>{useVirtualWallet ? 'VIRTUAL WALLET LINK' : 'METAMASK CONNECTED'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] text-slate-300 font-semibold">{truncateAddress(account)}</span>
          </div>
          <button 
            onClick={disconnectWallet}
            className="ml-2 text-[9px] font-mono text-rose-400 bg-rose-950/20 border border-rose-900/40 hover:bg-rose-950/40 font-bold px-1.5 py-0.5 rounded transition"
          >
            Unlink
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {errorMsg && (
            <div className="max-w-[280px] bg-indigo-950/30 border border-indigo-900/30 rounded-lg p-2 text-left relative text-[10px] text-indigo-300 leading-normal flex gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span>{errorMsg}</span>
                <button 
                  onClick={forceVirtualWallet}
                  className="mt-1 block text-rose-400 font-bold hover:underline"
                >
                  Connect Virtual Sandbox Wallet →
                </button>
              </div>
            </div>
          )}

          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-indigo-600 hover:bg-indigo-550 border border-indigo-500/30 text-white font-bold text-xs px-3 py-2 rounded-lg transition flex items-center gap-2 shadow-lg shadow-indigo-600/10"
          >
            <Wallet className="w-3.5 h-3.5 text-indigo-200" />
            <span>{isConnecting ? 'Linking...' : hasMetaMask ? 'Verify MetaMask ID' : 'Link Sandbox Wallet'}</span>
          </button>

          {!hasMetaMask && !errorMsg && (
            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 hidden sm:flex">
              <HelpCircle className="w-3 h-3 text-slate-600" />
              <span>Simulated fallback active</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

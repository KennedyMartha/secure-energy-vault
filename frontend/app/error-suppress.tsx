"use client";

import { useEffect } from "react";

// Suppress console errors related to CORS and Base Account SDK
export function ErrorSuppress() {
  useEffect(() => {
    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    // Filter out CORS and Base Account SDK warnings
    console.error = (...args: any[]) => {
      const message = args.join(" ");
      if (
        message.includes("Cross-Origin-Opener-Policy") ||
        message.includes("Base Account SDK") ||
        message.includes("Failed to fetch") ||
        message.includes("Analytics SDK") ||
        message.includes("Reown Config") ||
        message.includes("WalletConnect") ||
        message.includes("pulse.walletconnect.org") ||
        message.includes("api.web3modal.org") ||
        message.includes("cca-lite.coinbase.com")
      ) {
        // Suppress these specific errors
        return;
      }
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = args.join(" ");
      if (
        message.includes("Cross-Origin-Opener-Policy") ||
        message.includes("Base Account SDK") ||
        message.includes("Failed to fetch") ||
        message.includes("Analytics SDK") ||
        message.includes("Reown Config") ||
        message.includes("WalletConnect") ||
        message.includes("pulse.walletconnect.org") ||
        message.includes("api.web3modal.org") ||
        message.includes("cca-lite.coinbase.com")
      ) {
        // Suppress these specific warnings
        return;
      }
      originalWarn.apply(console, args);
    };

    // Hide any error notification elements that might appear in the DOM
    const hideErrorElements = () => {
      const errorSelectors = [
        '[data-testid*="error"]',
        '[aria-label*="issue" i]',
        '[class*="error-notification"]',
        '[class*="issue-badge"]',
        '[id*="error"]',
      ];
      
      errorSelectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(el => {
            const element = el as HTMLElement;
            if (element.textContent?.toLowerCase().includes('issue') || 
                element.textContent?.toLowerCase().includes('error')) {
              element.style.display = 'none';
            }
          });
        } catch (e) {
          // Ignore selector errors
        }
      });
    };

    // Run immediately and set up observer
    hideErrorElements();
    const observer = new MutationObserver(hideErrorElements);
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      observer.disconnect();
    };
  }, []);

  return null;
}


"use client";

import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { Sparkles } from "lucide-react";

export function Header() {
  const chainId = useChainId();
  const { isConnected } = useAccount();

  const getNetworkName = (id: number) => {
    switch (id) {
      case 31337: return "Local Hardhat";
      case 11155111: return "Sepolia";
      case 1: return "Ethereum Mainnet";
      default: return `Chain ${id}`;
    }
  };

  return (
    <header className="border-b border-primary/20 bg-gradient-to-r from-primary/10 via-background/95 to-accent/10 backdrop-blur-md sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1 group">
          <div className="relative">
            <Image
              src="/power-logo.svg"
              alt="Power Usage Logo"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 rounded-lg"
            />
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-primary animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Secure Energy Vault
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block animate-fade-in-up">
              Encrypted Power Usage Tracking
            </p>
          </div>
          {isConnected && (
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground ml-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Network: {getNetworkName(chainId)}</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <ConnectButton
              showBalance={{ smallScreen: false, largeScreen: true }}
              accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
              chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}


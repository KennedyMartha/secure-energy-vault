"use client";

/**
 * PowerUsageDemo Component
 *
 * Main component for the Power Usage tracking application.
 * Handles encrypted power usage record submission and decryption.
 * Supports both local Hardhat network and Sepolia testnet.
 *
 * Features:
 * - Encrypted data storage using FHEVM
 * - Real-time statistics dashboard
 * - Client-side decryption for privacy
 * - Comprehensive input validation
 */

import { useState, useEffect, useRef, useMemo } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useEthersSigner } from "../hooks/useEthersSigner";
import { usePowerUsage } from "@/hooks/usePowerUsage";
import { errorNotDeployed } from "./ErrorNotDeployed";
import { formatPowerUsage, formatTimestamp, formatRelativeTime } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

  // Constants for form validation
const MAX_PERIOD_DAYS = 365;
const MAX_POWER_USAGE = 10000; // kWh
const MIN_POWER_USAGE = 0.01; // kWh

export const PowerUsageDemo = () => {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const ethersSigner = useEthersSigner({ chainId });

  const [powerUsageValue, setPowerUsageValue] = useState<string>("");
  const [period, setPeriod] = useState<string>("");

  // Ensure component only renders after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Convert wagmi provider to ethers provider
  const ethersReadonlyProvider = publicClient ? new BrowserProvider(publicClient as any) : undefined;

  const sameChainRef = useRef<(cid: number | undefined) => boolean>(() => false);
  useEffect(() => {
    sameChainRef.current = (cid) => cid === chainId;
  }, [chainId]);

  const sameSignerRef = useRef<
    (signer: JsonRpcSigner | undefined) => boolean
  >(() => false);
  useEffect(() => {
    sameSignerRef.current = (signer) => {
      if (!signer || !ethersSigner) return false;
      return signer === ethersSigner;
    };
  }, [ethersSigner]);

  // For local network, use publicClient if available, otherwise use walletClient
  // FHEVM needs a provider that can make RPC calls
  const fhevmProvider = useMemo(() => {
    if (!isConnected || !chainId) return undefined;
    
    // For local hardhat network (chainId 31337), use publicClient
    if (chainId === 31337 && publicClient) {
      return (publicClient as any).transport;
    }
    
    // For other networks, try walletClient first, then publicClient
    if (walletClient?.transport) {
      return (walletClient as any).transport;
    }
    
    if (publicClient) {
      return (publicClient as any).transport;
    }
    
    return undefined;
  }, [isConnected, chainId, walletClient, publicClient]);

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider: fhevmProvider,
    chainId,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: isConnected && chainId !== undefined,
  });

  const powerUsage = usePowerUsage({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner: ethersSigner as any,
    ethersReadonlyProvider: ethersReadonlyProvider as any,
    sameChain: sameChainRef,
    sameSigner: sameSignerRef,
    userAddress: address, // Pass stable address as dependency
  });

  // Calculate total usage from decrypted records
  // FHEVM stores values multiplied by 100 for precision, so divide by 100 for display
  const totalUsage = powerUsage.records
    .filter(record => record.decryptedValue !== undefined)
    .reduce((sum, record) => sum + (record.decryptedValue || 0), 0) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(powerUsageValue);
    const periodNum = parseInt(period) || 1;

    if (isNaN(value) || value <= 0) {
      alert("Please enter a valid power usage value (kWh) greater than 0");
      return;
    }

    if (periodNum <= 0 || periodNum > 365) {
      alert("Please enter a valid period number between 1 and 365 days");
      return;
    }

    try {
      await powerUsage.submitRecord(value, periodNum);
      setPowerUsageValue("");
      setPeriod("");
    } catch (error) {
      console.error("Failed to submit record:", error);
      alert("Failed to submit record. Please try again.");
    }
  };


  // Show loading state during SSR and initial hydration
  if (!mounted) {
    return (
      <div className="mx-auto text-center py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Card className="max-w-md mx-auto animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Connect Your Wallet</CardTitle>
          <CardDescription className="text-center">
            Connect your wallet to start logging your power usage
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ConnectButton />
        </CardContent>
      </Card>
    );
  }

  if (powerUsage.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  return (
    <div className="grid w-full gap-6 max-w-6xl mx-auto px-4">
      <Card className="glass border-2 border-primary/20 shadow-xl animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-3xl font-bold gradient-text">
            Encrypted Power Usage Log
          </CardTitle>
          <CardDescription className="text-base">
            Record your household power usage with encrypted privacy protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {powerUsage.userStats && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Your Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{powerUsage.userStats.totalRecords}</div>
                    <div className="text-sm text-muted-foreground">Total Records</div>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-accent">
                      {powerUsage.records.filter(r => r.decryptedValue !== undefined).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Decrypted</div>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{formatPowerUsage(Math.round(totalUsage * 100))}</div>
                    <div className="text-sm text-muted-foreground">Total Usage</div>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-accent">
                      {powerUsage.userStats.totalRecords > 0
                        ? (powerUsage.userStats.totalPeriod / powerUsage.userStats.totalRecords).toFixed(1)
                        : '0'
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Period</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="powerUsage">Power Usage (kWh)</Label>
                <Input
                  id="powerUsage"
                  type="number"
                  step="0.01"
                  min="0"
                  value={powerUsageValue}
                  onChange={(e) => setPowerUsageValue(e.target.value)}
                  placeholder="150.5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Period (Days)</Label>
                <Input
                  id="period"
                  type="number"
                  min="1"
                  max="365"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={
                    !powerUsage.canSubmit ||
                    powerUsage.isSubmitting ||
                    !powerUsageValue ||
                    isNaN(parseFloat(powerUsageValue)) ||
                    parseFloat(powerUsageValue) <= 0 ||
                    !period ||
                    parseInt(period) <= 0
                  }
                  className="w-full"
                >
                  {powerUsage.isSubmitting ? "Submitting..." : "Submit Record"}
                </Button>
              </div>
            </div>
          </form>

          {powerUsage.message && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary-foreground">{powerUsage.message}</p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold gradient-text">
              Your Records ({powerUsage.records.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={powerUsage.loadUserRecords}
              disabled={!powerUsage.canLoadRecords || powerUsage.isLoading}
            >
              {powerUsage.isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>

          {powerUsage.records.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4 animate-float">⚡</div>
                <p className="text-lg text-muted-foreground mb-2">
                  No power usage records yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Submit your first record above to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {powerUsage.records.map((record, index) => (
                <Card
                  key={record.recordId}
                  className="card-hover border-primary/20 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Record #{record.recordId}</CardTitle>
                        <CardDescription>
                          Period: {record.period} days • {formatTimestamp(record.timestamp)}
                        </CardDescription>
                        <CardDescription className="text-xs mt-1">
                          {formatRelativeTime(record.timestamp)}
                        </CardDescription>
                      </div>
                      {record.decryptedValue === undefined && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => powerUsage.decryptRecord(record.recordId)}
                          disabled={powerUsage.isDecrypting === record.recordId}
                        >
                          {powerUsage.isDecrypting === record.recordId
                            ? "Decrypting..."
                            : "Decrypt"}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {record.decryptedValue !== undefined ? (
                      <div className="text-center p-4 bg-accent/10 rounded-lg">
                        <div className="text-3xl font-bold text-accent mb-1">
                          {formatPowerUsage(record.decryptedValue)}
                        </div>
                        <div className="text-sm text-muted-foreground">Decrypted Value</div>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">
                          🔒 Encrypted value stored on-chain
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};



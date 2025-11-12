"use client";

/**
 * PowerUsageDemo Component
 *
 * Main component for the Power Usage tracking application.
 * Handles encrypted power usage record submission and decryption.
 * Supports both local Hardhat network and Sepolia testnet.
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

  const totalUsage = powerUsage.records
    .filter(record => record.decryptedValue !== undefined)
    .reduce((sum, record) => sum + (record.decryptedValue || 0), 0) * 100; // Convert from stored format

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(powerUsageValue);
    const periodNum = parseInt(period) || 1;

    if (isNaN(value) || value <= 0) {
      alert("Please enter a valid power usage value (kWh)");
      return;
    }

    if (periodNum <= 0) {
      alert("Please enter a valid period number");
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

  const buttonClass =
    "inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm " +
    "transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

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
      <div className="mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-6">Connect your wallet to start logging your power usage</p>
        <ConnectButton />
      </div>
    );
  }

  if (powerUsage.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  return (
    <div className="grid w-full gap-6 max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Encrypted Power Usage Log
        </h1>
        <p className="text-gray-600 mb-6">
          Record your household power usage with encrypted privacy protection
        </p>

        {powerUsage.userStats && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Your Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Total Records:</span>
                <span className="ml-2 text-blue-900">{powerUsage.userStats.totalRecords}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Decrypted:</span>
                <span className="ml-2 text-blue-900">
                  {powerUsage.records.filter(r => r.decryptedValue !== undefined).length}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Total Usage:</span>
                <span className="ml-2 text-blue-900">{formatPowerUsage(Math.round(totalUsage * 100))}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Avg Period:</span>
                <span className="ml-2 text-blue-900">
                  {powerUsage.userStats.totalRecords > 0
                    ? (powerUsage.userStats.totalPeriod / powerUsage.userStats.totalRecords).toFixed(1)
                    : '0'
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="powerUsage" className="block text-sm font-medium text-gray-700 mb-2">
                Power Usage (kWh)
              </label>
              <input
                id="powerUsage"
                type="number"
                step="0.01"
                min="0"
                value={powerUsageValue}
                onChange={(e) => setPowerUsageValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="150.5"
                required
              />
            </div>
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                Period (Day/Month)
              </label>
              <input
                id="period"
                type="number"
                min="1"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
            </div>
            <div className="flex items-end">
              <button
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
                className={buttonClass + " w-full"}
              >
                {powerUsage.isSubmitting ? "Submitting..." : "Submit Record"}
              </button>
            </div>
          </div>
        </form>

        {powerUsage.message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">{powerUsage.message}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Records</h2>
          <button
            onClick={powerUsage.loadUserRecords}
            disabled={!powerUsage.canLoadRecords || powerUsage.isLoading}
            className={buttonClass + " text-sm px-3 py-1"}
          >
            {powerUsage.isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {powerUsage.records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No power usage records yet.</p>
            <p className="text-sm mt-2">Submit your first record above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {powerUsage.records.map((record) => (
              <div
                key={record.recordId}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-semibold text-gray-900">
                        Record #{record.recordId}
                      </span>
                      <span className="text-sm text-gray-500">
                        Period: {record.period}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(record.timestamp)} ({formatRelativeTime(record.timestamp)})
                      </span>
                    </div>
                    {record.decryptedValue !== undefined ? (
                      <div className="mt-2">
                        <span className="text-lg font-bold text-green-600">
                          {formatPowerUsage(record.decryptedValue)}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">(Decrypted)</span>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">
                          Encrypted value stored on-chain
                        </span>
                      </div>
                    )}
                  </div>
                  {record.decryptedValue === undefined && (
                    <button
                      onClick={() => powerUsage.decryptRecord(record.recordId)}
                      disabled={powerUsage.isDecrypting === record.recordId}
                      className={buttonClass + " ml-4 text-sm px-3 py-1"}
                    >
                      {powerUsage.isDecrypting === record.recordId
                        ? "Decrypting..."
                        : "Decrypt"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};



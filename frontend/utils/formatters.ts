/**
 * Utility functions for formatting numbers, dates, and other data
 */

/**
 * Format power usage value for display
 * @param value - The raw value (stored as integer with 2 decimal places)
 * @returns Formatted string with kWh unit
 */
export function formatPowerUsage(value: number): string {
  // Convert from stored integer format (multiplied by 100) back to decimal
  const decimalValue = value / 100;
  return `${decimalValue.toFixed(2)} kWh`;
}

/**
 * Format timestamp to human-readable date string
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param timestamp - Unix timestamp in seconds
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(diff / 3600);
  const days = Math.floor(diff / 86400);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Truncate Ethereum address for display
 * @param address - Full Ethereum address
 * @returns Truncated address (e.g., 0x1234...5678)
 */
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format transaction hash for display
 * @param hash - Full transaction hash
 * @returns Truncated hash
 */
export function truncateHash(hash: string): string {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

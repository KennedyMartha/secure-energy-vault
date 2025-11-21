# Power Usage Log - Encrypted Household Power Usage

A decentralized application for recording and managing household power usage with encrypted privacy protection using Zama FHEVM technology.

## 🚀 Live Demo

- **Application**: [https://powerrr.vercel.app/](https://powerrr.vercel.app/)
- **Demo Video**: [Application Demo](https://raw.githubusercontent.com/KennedyMartha/secure-energy-vault/master/power.mp4)

## 📋 Contract Information

- **Sepolia Testnet Contract**: `0x12D41ef4594ee82C9a698aC4078E0A67AA9dc743`
- **Network**: Sepolia Testnet
- **Block Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x12D41ef4594ee82C9a698aC4078E0A67AA9dc743)
- **Deployment Status**: ✅ Deployed and verified
- **Frontend Status**: ✅ Deployed on Vercel

## Overview

This project allows users to:
- **Submit** encrypted power usage records (kWh) to the blockchain
- **View** their encrypted power usage records
- **Decrypt** and view actual power usage values locally

All power usage data is encrypted using Fully Homomorphic Encryption (FHE), ensuring privacy while allowing on-chain storage and computation.

## User Statistics

The application provides comprehensive user analytics:

- **Total Records**: Number of power usage records submitted
- **Decrypted Records**: Count of records that have been decrypted locally
- **Total Usage**: Sum of all decrypted power usage values
- **Average Period**: Mean period value across all records

Statistics are calculated on-chain and displayed in real-time in the user dashboard.

## Features

- 🔐 **Encrypted Storage**: Power usage values are encrypted before being stored on-chain using FHEVM
- 🔑 **Local Decryption**: Only the record owner can decrypt their data client-side
- 📊 **Record Management**: Track multiple power usage records with period identifiers
- 📈 **User Statistics Dashboard**: Real-time analytics showing total records, decrypted records, total usage, and average period
- 🌈 **Rainbow Wallet Integration**: Modern wallet connection using RainbowKit with MetaMask support
- 🧪 **Comprehensive Testing**: Full test coverage for local Hardhat and Sepolia testnet
- 🎨 **Modern UI**: Responsive design with real-time formatting and improved UX
- 📱 **Mobile Responsive**: Fully responsive design that works on all device sizes

## Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager
- **Rainbow Wallet**: Browser extension for wallet connection

### Installation

1. **Install dependencies**

   ```bash
   npm install
   cd frontend && npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY  # Optional
   ```

3. **Compile contracts**

   ```bash
   npm run compile
   ```

4. **Run tests**

   ```bash
   npm test
   ```

### Deployment

#### Local Development

1. **Start local Hardhat node**

   ```bash
   npx hardhat node
   ```

2. **Deploy contract** (in another terminal)

   ```bash
   npx hardhat deploy --network localhost
   ```

3. **Generate ABIs for frontend**

   ```bash
   cd frontend && npm run genabi
   ```

4. **Start frontend**

   ```bash
   cd frontend && npm run dev
   ```

#### Sepolia Testnet

1. **Deploy to Sepolia**

   ```bash
   npx hardhat deploy --network sepolia
   ```

2. **Generate ABIs**

   ```bash
   cd frontend && npm run genabi
   ```

3. **Test on Sepolia**

   ```bash
   npm run test:sepolia
   ```

## Project Structure

```
secure-energy-vault/
├── contracts/
│   └── PowerUsage.sol           # Main FHE smart contract
├── deploy/
│   └── deploy.ts                # Hardhat deployment script
├── test/
│   ├── PowerUsage.ts            # Local Hardhat tests
│   └── PowerUsageSepolia.ts     # Sepolia testnet tests
├── tasks/
│   └── PowerUsage.ts            # Hardhat custom tasks
├── frontend/
│   ├── app/                     # Next.js 15 app directory
│   ├── components/              # React components
│   ├── hooks/                   # Custom React hooks
│   ├── config/                  # Wagmi & RainbowKit config
│   ├── fhevm/                   # FHEVM utilities & hooks
│   ├── abi/                     # Generated contract ABIs
│   └── utils/                   # Helper utilities
├── demo-videos/                 # Demo video files
├── scripts/                     # Setup and utility scripts
├── types/                       # TypeScript type definitions
├── hardhat.config.ts           # Hardhat configuration
└── package.json                # Project dependencies
```

## Contract Functions

### PowerUsage.sol

- `addRecord(encryptedUsage, proof, period)` - Add encrypted power usage record
- `getRecordUsage(recordId)` - Get encrypted usage value (owner access only)
- `getRecordMetadata(recordId)` - Get record metadata (owner, timestamp, period)
- `getUserRecords(address)` - Get all record IDs for a user
- `getUserRecordCount(address)` - Get count of user records
- `getUserStats(address)` - Get user statistics (total records, total period)
- `getUserRecordsInPeriodRange(address, minPeriod, maxPeriod)` - Filter records by period range
- `getUserRecordByIndex(address, index)` - Get specific record ID by index
- `recordExists(recordId)` - Check if record exists
- `getTotalRecords()` - Get total number of records created

## Hardhat Tasks

```bash
# Get contract address
npx hardhat task:address --network localhost

# Add a power usage record
npx hardhat task:add-record --value 150 --period 1 --network localhost

# Get record metadata
npx hardhat task:get-record --id 1 --network localhost

# Decrypt a record
npx hardhat task:decrypt-record --id 1 --network localhost
```

## Frontend Usage

1. **Connect Wallet**: Click "Connect Wallet" button and select Rainbow wallet (MetaMask, etc.)
2. **View Statistics**: Check your dashboard showing total records, decrypted records, total usage, and average period
3. **Submit Record**: Enter power usage value (kWh) and period, then click "Submit Record"
4. **View Records**: Your records appear in a formatted list with timestamps and period information
5. **Decrypt Record**: Click "Decrypt" button on any record to view the actual encrypted value
6. **Refresh Data**: Use the "Refresh" button to reload your records and statistics

## Testing

### Local Tests

```bash
npm test
```

Tests include:
- Contract initialization
- Adding records
- Retrieving and decrypting records
- Multiple records per user
- Record existence checks

### Sepolia Tests

```bash
npm run test:sepolia
```

**Note**: Requires contract to be deployed on Sepolia first.

## Environment Setup

Create a `.env.local` file in the frontend directory:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x12D41ef4594ee82C9a698aC4078E0A67AA9dc743
NEXT_PUBLIC_NETWORK=sepolia
```

## Technology Stack

- **Smart Contracts**: Solidity 0.8.27
- **FHE**: Zama FHEVM (@fhevm/solidity ^0.8.0, @zama-fhe/relayer-sdk 0.2.0)
- **Frontend**: Next.js 15.4.2, React 19.1.0
- **Wallet**: RainbowKit 2.2.8, wagmi 2.17.0, viem 2.37.6
- **Testing**: Hardhat 2.26.0, Chai, Mocha, Vitest 3.2.4
- **Type Safety**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 3.4.1
- **Build Tools**: Turbopack, ESLint, Prettier
- **Deployment**: Vercel, Hardhat Deploy

## Security Considerations

- Power usage values are encrypted before submission
- Only the record owner can decrypt their data
- All encryption/decryption happens client-side
- Contract uses FHEVM for encrypted computation

## License

This project is licensed under the BSD-3-Clause-Clear License.

## Support

- **FHEVM Documentation**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Zama Community**: [Discord](https://discord.gg/zama)

---

**Built with ❤️ using Zama FHEVM**



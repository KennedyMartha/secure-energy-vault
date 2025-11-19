# Power Usage Log - Encrypted Household Power Usage

A decentralized application for recording and managing household power usage with encrypted privacy protection using Zama FHEVM technology.

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

- 🔐 **Encrypted Storage**: Power usage values are encrypted before being stored on-chain
- 🔑 **Local Decryption**: Only the record owner can decrypt their data
- 📊 **Record Management**: Track multiple power usage records with period identifiers
- 📈 **User Statistics**: View comprehensive analytics including total usage and record counts
- 🎛️ **Advanced Filtering**: Query records by period ranges and user statistics
- 🌈 **Rainbow Wallet Integration**: Modern wallet connection using RainbowKit
- 🧪 **Comprehensive Testing**: Full test coverage for local and Sepolia networks
- 🎨 **Modern UI**: Responsive design with real-time formatting and relative timestamps
- ⚡ **Performance Optimized**: Efficient data loading and caching strategies

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
pro26/
├── contracts/
│   └── PowerUsage.sol      # Main smart contract
├── deploy/
│   └── deploy.ts           # Deployment script
├── test/
│   ├── PowerUsage.ts       # Local tests
│   └── PowerUsageSepolia.ts # Sepolia tests
├── tasks/
│   └── PowerUsage.ts       # Hardhat tasks
├── frontend/
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── config/            # Configuration files
│   └── abi/               # Generated contract ABIs
└── hardhat.config.ts      # Hardhat configuration
```

## Contract Functions

### PowerUsage.sol

- `addRecord(encryptedUsage, proof, period)` - Add encrypted power usage record
- `getRecordUsage(recordId)` - Get encrypted usage value
- `getRecordMetadata(recordId)` - Get record metadata (owner, timestamp, period)
- `getUserRecords(address)` - Get all record IDs for a user
- `getUserRecordCount(address)` - Get count of user records
- `recordExists(recordId)` - Check if record exists

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

1. **Connect Wallet**: Click "Connect Wallet" button (top right) and select Rainbow wallet
2. **Submit Record**: Enter power usage value (kWh) and period, then click "Submit Record"
3. **View Records**: Your records will appear in the list below
4. **Decrypt Record**: Click "Decrypt" button on any record to view the actual value

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

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration for code formatting
- Use conventional commit messages for all changes
- Maintain comprehensive test coverage

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch for features
- `feature/*` - Feature branches
- `hotfix/*` - Hotfix branches

### Environment Setup

Create a `.env.local` file in the frontend directory:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_NETWORK=localhost
```

## Technology Stack

- **Smart Contracts**: Solidity 0.8.27
- **FHE**: Zama FHEVM
- **Frontend**: Next.js 15, React 19
- **Wallet**: RainbowKit, wagmi, viem
- **Testing**: Hardhat, Chai, Mocha
- **Type Safety**: TypeScript
- **Styling**: Tailwind CSS

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



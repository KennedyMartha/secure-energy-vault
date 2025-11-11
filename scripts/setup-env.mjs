#!/usr/bin/env node

/**
 * Environment Setup Script
 * Helps set up environment variables for the Power Usage application
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const envExamplePath = join(process.cwd(), '.env.example');
const envPath = join(process.cwd(), '.env');

console.log('🔧 Setting up environment variables for Power Usage Application...\n');

// Check if .env already exists
if (existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Skipping setup.');
  console.log('   Edit .env manually or delete it to run setup again.');
  process.exit(0);
}

// Create .env.example if it doesn't exist
const envExampleContent = `# Environment Variables for Power Usage Application

# Hardhat Configuration
MNEMONIC="your twelve word mnemonic here"
INFURA_API_KEY="your_infura_api_key"
PRIVATE_KEY="your_private_key_for_testnets"

# Etherscan API Key for Contract Verification
ETHERSCAN_API_KEY="your_etherscan_api_key"

# Frontend Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_NETWORK="localhost"

# FHEVM Configuration
FHEVM_NETWORK_URL="http://localhost:8545"
FHEVM_PRIVATE_KEY="your_fhevm_private_key"
`;

if (!existsSync(envExamplePath)) {
  writeFileSync(envExamplePath, envExampleContent);
  console.log('✅ Created .env.example file');
} else {
  console.log('ℹ️  .env.example already exists');
}

// Create basic .env file
const envContent = `# Copy from .env.example and fill in your values
MNEMONIC=""
INFURA_API_KEY=""
PRIVATE_KEY=""
ETHERSCAN_API_KEY=""
NEXT_PUBLIC_CONTRACT_ADDRESS=""
NEXT_PUBLIC_NETWORK="localhost"
`;

writeFileSync(envPath, envContent);
console.log('✅ Created .env file');
console.log('\n📝 Next steps:');
console.log('   1. Edit .env file with your actual values');
console.log('   2. Run: npx hardhat vars set MNEMONIC');
console.log('   3. Run: npx hardhat vars set INFURA_API_KEY');
console.log('   4. Run: npm run dev');

console.log('\n🎉 Environment setup complete!');

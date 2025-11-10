#!/bin/bash
# Bash script to start Hardhat node with reduced output
# Usage: ./scripts/start-node-quiet.sh

echo "Starting Hardhat node (output redirected to hardhat-node.log)..."
echo "To view logs in real-time, run: tail -f hardhat-node.log"
echo "Press Ctrl+C to stop the node"
echo ""

# Start Hardhat node and redirect output to log file
npx hardhat node > hardhat-node.log 2>&1


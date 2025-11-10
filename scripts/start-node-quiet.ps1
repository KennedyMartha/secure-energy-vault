# PowerShell script to start Hardhat node with reduced output
# Usage: .\scripts\start-node-quiet.ps1

Write-Host "Starting Hardhat node (output redirected to hardhat-node.log)..." -ForegroundColor Green
Write-Host "To view logs in real-time, run: Get-Content hardhat-node.log -Wait -Tail 50" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the node" -ForegroundColor Yellow
Write-Host ""

# Start Hardhat node and redirect output to log file
npx hardhat node *> hardhat-node.log


#!/usr/bin/env node
/**
 * Pre-deployment check script
 * Verifies that all required files and configurations are in place for Vercel deployment
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, "..");
const rootDir = path.resolve(frontendDir, "..");

const errors = [];
const warnings = [];
const info = [];

function checkFile(filePath, description, required = true) {
  const fullPath = path.resolve(frontendDir, filePath);
  if (fs.existsSync(fullPath)) {
    info.push(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    const msg = `${required ? "❌" : "⚠️"} ${description}: ${filePath} ${required ? "MISSING" : "not found"}`;
    if (required) {
      errors.push(msg);
    } else {
      warnings.push(msg);
    }
    return false;
  }
}

function checkDeploymentFile() {
  const deploymentPath = path.join(rootDir, "deployments", "sepolia", "PowerUsage.json");
  if (fs.existsSync(deploymentPath)) {
    try {
      const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
      if (deployment.address && deployment.address !== "0x0000000000000000000000000000000000000000") {
        info.push(`✅ Sepolia deployment found: ${deployment.address}`);
        return true;
      } else {
        errors.push("❌ Sepolia deployment file exists but address is zero");
        return false;
      }
    } catch (e) {
      errors.push(`❌ Failed to parse deployment file: ${e.message}`);
      return false;
    }
  } else {
    errors.push("❌ Sepolia deployment file not found: deployments/sepolia/PowerUsage.json");
    return false;
  }
}

function checkABIFiles() {
  const abiPath = path.join(frontendDir, "abi", "PowerUsageABI.ts");
  const addressesPath = path.join(frontendDir, "abi", "PowerUsageAddresses.ts");
  
  const abiExists = fs.existsSync(abiPath);
  const addressesExists = fs.existsSync(addressesPath);
  
  if (abiExists && addressesExists) {
    info.push("✅ ABI files generated");
    return true;
  } else {
    warnings.push("⚠️ ABI files not found. Run 'npm run genabi' to generate them.");
    return false;
  }
}

function checkPackageJson() {
  const packageJsonPath = path.join(frontendDir, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      if (pkg.scripts && pkg.scripts.build) {
        if (pkg.scripts.build.includes("genabi")) {
          info.push("✅ Build script includes 'genabi'");
          return true;
        } else {
          warnings.push("⚠️ Build script should include 'genabi' before 'next build'");
          return false;
        }
      }
    } catch (e) {
      errors.push(`❌ Failed to parse package.json: ${e.message}`);
      return false;
    }
  }
  return false;
}

console.log("\n🔍 Pre-Deployment Check for Vercel\n");
console.log("=" .repeat(60));

// Check required files
checkFile("vercel.json", "Vercel configuration");
checkFile("next.config.ts", "Next.js configuration");
checkFile("package.json", "Package configuration");
checkFile(".vercelignore", "Vercel ignore file", false);

// Check deployment files
const deploymentOk = checkDeploymentFile();

// Check ABI files
const abiOk = checkABIFiles();

// Check build script
checkPackageJson();

// Check environment variables
const envExample = `
# Environment Variables for Vercel:
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (optional)
# Get from: https://cloud.walletconnect.com
`;

console.log("\n📋 Results:\n");

if (info.length > 0) {
  console.log("✅ Checks Passed:");
  info.forEach(msg => console.log(`   ${msg}`));
}

if (warnings.length > 0) {
  console.log("\n⚠️  Warnings:");
  warnings.forEach(msg => console.log(`   ${msg}`));
}

if (errors.length > 0) {
  console.log("\n❌ Errors (must fix before deployment):");
  errors.forEach(msg => console.log(`   ${msg}`));
  console.log("\n❌ Deployment check FAILED. Please fix the errors above.");
  process.exit(1);
} else {
  console.log("\n✅ All critical checks passed!");
  console.log("\n📝 Next Steps:");
  console.log("   1. Ensure deployments/sepolia/PowerUsage.json is committed to Git");
  console.log("   2. Set environment variables in Vercel dashboard");
  console.log("   3. Configure Vercel project root directory to 'frontend'");
  console.log("   4. Deploy!");
  console.log(envExample);
  process.exit(0);
}


import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Batch operations task for adding multiple power usage records
 */
task("batch:add-records", "Add multiple power usage records in batch")
  .addParam("values", "Comma-separated list of power usage values (e.g., '150,200,175')")
  .addParam("period", "Period identifier for all records")
  .setAction(async (taskArgs: TaskArguments, hre) => {
    const { ethers, fhevm } = hre;
    const { values, period } = taskArgs;

    // Parse values
    const powerValues = values.split(',').map((v: string) => parseInt(v.trim()));

    // Get contract instance
    const powerUsage = await hre.ethers.getContractAt("PowerUsage", await hre.deployments.get("PowerUsage").address);

    console.log(`Adding ${powerValues.length} power usage records for period ${period}...`);

    for (let i = 0; i < powerValues.length; i++) {
      const value = powerValues[i];
      console.log(`Adding record ${i + 1}/${powerValues.length}: ${value} kWh`);

      // Encrypt the power usage value
      const encryptedValue = await fhevm.encrypt32(value);

      // Add the record
      const tx = await powerUsage.addRecord(encryptedValue.handles[0], encryptedValue.inputProof, period);
      await tx.wait();

      console.log(`✅ Record ${i + 1} added successfully`);
    }

    console.log(`\n🎉 Successfully added ${powerValues.length} power usage records!`);
  });

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the PowerUsage contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the PowerUsage contract
 *
 *   npx hardhat --network localhost task:add-record --value 150 --period 1
 *   npx hardhat --network localhost task:get-record --id 1
 *   npx hardhat --network localhost task:decrypt-record --id 1
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the PowerUsage contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the PowerUsage contract
 *
 *   npx hardhat --network sepolia task:add-record --value 150 --period 1
 *   npx hardhat --network sepolia task:get-record --id 1
 *   npx hardhat --network sepolia task:decrypt-record --id 1
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */
task("task:address", "Prints the PowerUsage address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const powerUsage = await deployments.get("PowerUsage");

  console.log("PowerUsage address is " + powerUsage.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:add-record --value 150 --period 1
 *   - npx hardhat --network sepolia task:add-record --value 150 --period 1
 */
task("task:add-record", "Adds a new power usage record")
  .addOptionalParam("address", "Optionally specify the PowerUsage contract address")
  .addParam("value", "The power usage value in kWh")
  .addParam("period", "The period identifier (day/month number)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const value = parseInt(taskArguments.value);
    const period = parseInt(taskArguments.period);
    
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`Argument --value must be a positive integer`);
    }
    if (!Number.isInteger(period) || period <= 0) {
      throw new Error(`Argument --period must be a positive integer`);
    }

    await fhevm.initializeCLIApi();

    const PowerUsageDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PowerUsage");
    console.log(`PowerUsage: ${PowerUsageDeployment.address}`);

    const signers = await ethers.getSigners();

    const powerUsageContract = await ethers.getContractAt("PowerUsage", PowerUsageDeployment.address);

    // Encrypt the value passed as argument
    const encryptedValue = await fhevm
      .createEncryptedInput(PowerUsageDeployment.address, signers[0].address)
      .add32(value)
      .encrypt();

    const tx = await powerUsageContract
      .connect(signers[0])
      .addRecord(encryptedValue.handles[0], encryptedValue.inputProof, period);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`PowerUsage addRecord(${value} kWh, period ${period}) succeeded!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-record --id 1
 *   - npx hardhat --network sepolia task:get-record --id 1
 */
task("task:get-record", "Gets record metadata")
  .addOptionalParam("address", "Optionally specify the PowerUsage contract address")
  .addParam("id", "The record ID")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const recordId = parseInt(taskArguments.id);
    if (!Number.isInteger(recordId) || recordId <= 0) {
      throw new Error(`Argument --id must be a positive integer`);
    }

    const PowerUsageDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PowerUsage");
    console.log(`PowerUsage: ${PowerUsageDeployment.address}`);

    const powerUsageContract = await ethers.getContractAt("PowerUsage", PowerUsageDeployment.address);

    const [owner, timestamp, period] = await powerUsageContract.getRecordMetadata(recordId);
    const encryptedUsage = await powerUsageContract.getRecordUsage(recordId);

    console.log(`Record #${recordId}:`);
    console.log(`  Owner: ${owner}`);
    console.log(`  Period: ${period}`);
    console.log(`  Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`);
    console.log(`  Encrypted Usage: ${encryptedUsage}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-record --id 1
 *   - npx hardhat --network sepolia task:decrypt-record --id 1
 */
task("task:decrypt-record", "Decrypts a power usage record")
  .addOptionalParam("address", "Optionally specify the PowerUsage contract address")
  .addParam("id", "The record ID")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const recordId = parseInt(taskArguments.id);
    if (!Number.isInteger(recordId) || recordId <= 0) {
      throw new Error(`Argument --id must be a positive integer`);
    }

    await fhevm.initializeCLIApi();

    const PowerUsageDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PowerUsage");
    console.log(`PowerUsage: ${PowerUsageDeployment.address}`);

    const signers = await ethers.getSigners();

    const powerUsageContract = await ethers.getContractAt("PowerUsage", PowerUsageDeployment.address);

    const encryptedUsage = await powerUsageContract.getRecordUsage(recordId);
    if (encryptedUsage === ethers.ZeroHash) {
      console.log(`Record #${recordId} is not initialized`);
      return;
    }

    const clearUsage = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedUsage,
      PowerUsageDeployment.address,
      signers[0],
    );
    
    console.log(`Record #${recordId}:`);
    console.log(`  Encrypted Usage: ${encryptedUsage}`);
    console.log(`  Clear Usage    : ${clearUsage} kWh`);
  });



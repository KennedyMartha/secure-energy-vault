import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { PowerUsage, PowerUsage__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("PowerUsage")) as PowerUsage__factory;
  const powerUsageContract = (await factory.deploy()) as PowerUsage;
  const powerUsageContractAddress = await powerUsageContract.getAddress();

  return { powerUsageContract, powerUsageContractAddress };
}

describe("PowerUsage Contract", function () {
  this.timeout(60000); // Increase timeout for FHE operations

  let signers: Signers;
  let powerUsageContract: PowerUsage;
  let powerUsageContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ powerUsageContract, powerUsageContractAddress } = await deployFixture());
  });

  it("should initialize with zero records", async function () {
    const totalRecords = await powerUsageContract.getTotalRecords();
    expect(totalRecords).to.eq(0);
  });

  it("should add a power usage record", async function () {
    const powerUsage = 150; // kWh
    const period = 1;

    // Encrypt power usage value as a euint32
    const encryptedPowerUsage = await fhevm
      .createEncryptedInput(powerUsageContractAddress, signers.alice.address)
      .add32(powerUsage)
      .encrypt();

    const tx = await powerUsageContract
      .connect(signers.alice)
      .addRecord(encryptedPowerUsage.handles[0], encryptedPowerUsage.inputProof, period);
    await tx.wait();

    const totalRecords = await powerUsageContract.getTotalRecords();
    expect(totalRecords).to.eq(1);

    const userRecordCount = await powerUsageContract.getUserRecordCount(signers.alice.address);
    expect(userRecordCount).to.eq(1);

    const recordId = await powerUsageContract.getUserRecordByIndex(signers.alice.address, 0);
    expect(recordId).to.eq(1);

    const [owner, timestamp, recordPeriod] = await powerUsageContract.getRecordMetadata(recordId);
    expect(owner).to.eq(signers.alice.address);
    expect(recordPeriod).to.eq(period);
    expect(timestamp).to.be.gt(0);
  });

  it("should retrieve and decrypt power usage record", async function () {
    const powerUsage = 200; // kWh
    const period = 2;

    // Encrypt power usage value
    const encryptedPowerUsage = await fhevm
      .createEncryptedInput(powerUsageContractAddress, signers.alice.address)
      .add32(powerUsage)
      .encrypt();

    const tx = await powerUsageContract
      .connect(signers.alice)
      .addRecord(encryptedPowerUsage.handles[0], encryptedPowerUsage.inputProof, period);
    await tx.wait();

    const recordId = await powerUsageContract.getUserRecordByIndex(signers.alice.address, 0);
    const encryptedUsage = await powerUsageContract.getRecordUsage(recordId);

    // Decrypt the encrypted usage
    const clearUsage = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedUsage,
      powerUsageContractAddress,
      signers.alice,
    );

    expect(clearUsage).to.eq(powerUsage);
  });

  it("should allow multiple records per user", async function () {
    const powerUsage1 = 150;
    const powerUsage2 = 175;
    const period1 = 1;
    const period2 = 2;

    // Add first record
    const encryptedPowerUsage1 = await fhevm
      .createEncryptedInput(powerUsageContractAddress, signers.alice.address)
      .add32(powerUsage1)
      .encrypt();

    let tx = await powerUsageContract
      .connect(signers.alice)
      .addRecord(encryptedPowerUsage1.handles[0], encryptedPowerUsage1.inputProof, period1);
    await tx.wait();

    // Add second record
    const encryptedPowerUsage2 = await fhevm
      .createEncryptedInput(powerUsageContractAddress, signers.alice.address)
      .add32(powerUsage2)
      .encrypt();

    tx = await powerUsageContract
      .connect(signers.alice)
      .addRecord(encryptedPowerUsage2.handles[0], encryptedPowerUsage2.inputProof, period2);
    await tx.wait();

    const userRecordCount = await powerUsageContract.getUserRecordCount(signers.alice.address);
    expect(userRecordCount).to.eq(2);

    const totalRecords = await powerUsageContract.getTotalRecords();
    expect(totalRecords).to.eq(2);
  });

  it("should check if record exists", async function () {
    const powerUsage = 100;
    const period = 1;

    const encryptedPowerUsage = await fhevm
      .createEncryptedInput(powerUsageContractAddress, signers.alice.address)
      .add32(powerUsage)
      .encrypt();

    const tx = await powerUsageContract
      .connect(signers.alice)
      .addRecord(encryptedPowerUsage.handles[0], encryptedPowerUsage.inputProof, period);
    await tx.wait();

    const recordId = await powerUsageContract.getUserRecordByIndex(signers.alice.address, 0);
    const exists = await powerUsageContract.recordExists(recordId);
    expect(exists).to.be.true;

    const nonExistent = await powerUsageContract.recordExists(999);
    expect(nonExistent).to.be.false;
  });
});



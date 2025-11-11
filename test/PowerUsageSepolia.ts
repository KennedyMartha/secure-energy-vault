import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { PowerUsage } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("PowerUsageSepolia", function () {
  let signers: Signers;
  let powerUsageContract: PowerUsage;
  let powerUsageContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const PowerUsageDeployment = await deployments.get("PowerUsage");
      powerUsageContractAddress = PowerUsageDeployment.address;
      powerUsageContract = await ethers.getContractAt("PowerUsage", PowerUsageDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should add and retrieve a power usage record", async function () {
    steps = 10;

    this.timeout(4 * 40000);

    const powerUsage = 150; // kWh
    const period = 1;

    progress(`Encrypting power usage value '${powerUsage}'...`);
    const encryptedPowerUsage = await fhevm
      .createEncryptedInput(powerUsageContractAddress, signers.alice.address)
      .add32(powerUsage)
      .encrypt();

    progress(
      `Call addRecord() PowerUsage=${powerUsageContractAddress} handle=${ethers.hexlify(encryptedPowerUsage.handles[0])} signer=${signers.alice.address}...`,
    );
    let tx = await powerUsageContract
      .connect(signers.alice)
      .addRecord(encryptedPowerUsage.handles[0], encryptedPowerUsage.inputProof, period);
    await tx.wait();

    progress(`Call PowerUsage.getTotalRecords()...`);
    const totalRecords = await powerUsageContract.getTotalRecords();
    expect(totalRecords).to.be.gte(1);

    progress(`Call PowerUsage.getUserRecordCount()...`);
    const userRecordCount = await powerUsageContract.getUserRecordCount(signers.alice.address);
    expect(userRecordCount).to.be.gte(1);

    progress(`Call PowerUsage.getUserRecordByIndex()...`);
    const recordId = await powerUsageContract.getUserRecordByIndex(signers.alice.address, 0);

    progress(`Call PowerUsage.getRecordUsage()...`);
    const encryptedUsage = await powerUsageContract.getRecordUsage(recordId);
    expect(encryptedUsage).to.not.eq(ethers.ZeroHash);

    progress(`Decrypting PowerUsage.getRecordUsage()=${encryptedUsage}...`);
    const clearUsage = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedUsage,
      powerUsageContractAddress,
      signers.alice,
    );
    progress(`Clear PowerUsage.getRecordUsage()=${clearUsage}`);

    expect(clearUsage).to.eq(powerUsage);
  });
});



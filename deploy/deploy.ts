import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedPowerUsage = await deploy("PowerUsage", {
    from: deployer,
    log: true,
    gasLimit: 8_000_000,
    waitConfirmations: hre.network.name === "hardhat" ? 1 : 2,
  });

  console.log(`PowerUsage contract deployed to: ${deployedPowerUsage.address}`);
  console.log(`Deployment transaction hash: ${deployedPowerUsage.transactionHash}`);

  // Verify contract on Etherscan if not on local network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: deployedPowerUsage.address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Contract verification failed:", error);
    }
  }
};
export default func;
func.id = "deploy_powerUsage"; // id required to prevent reexecution
func.tags = ["PowerUsage"];



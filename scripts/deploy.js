import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ZkryptFHEContract with FHEVM to Sepolia...");

  const ZkryptFHE = await ethers.getContractFactory("ZkryptFHEContract");
  const zkrypt = await ZkryptFHE.deploy(1000000, 1000);

  await zkrypt.waitForDeployment();
  console.log(" ZkryptFHEContract deployed to:", await zkrypt.getAddress());
  console.log(" FHEVM Sepolia Config: Active");
  console.log(" Faucet drip: 1000 ZKT");
  console.log(" Copy this address to your frontend:");
  console.log(`CONTRACT_ADDRESS = "${await zkrypt.getAddress()}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

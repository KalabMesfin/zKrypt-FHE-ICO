import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const ZKrypt = await hre.ethers.getContractFactory("zKrypt");
  const zkrypt = await ZKrypt.deploy(1000000);

  await zkrypt.deployed();
  console.log("Contract deployed to:", zkrypt.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
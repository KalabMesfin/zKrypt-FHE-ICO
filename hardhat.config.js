import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  defaultNetwork: "sepolia",
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          // Optional: override EVM version if needed
          // evmVersion: "paris",
        },
      },
    ],
  },

  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/YibeZMSlbYTdxyx3PPREI",
      accounts: [
        "0x006cdf46f3c34675d1be8470e6fbe37c041fad01c2a3091edb10c69f06da7536",
      ],
      chainId: 11155111,
    },
  },

  gasReporter: {
    enabled: true,
    currency: "USD",
  },

  etherscan: {
    apiKey: "MR7XVN215E52QCUGI7WD1C4QCKIPM7Q61D",
  },
};

export default config;
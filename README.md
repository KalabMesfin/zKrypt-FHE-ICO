# zKrypt FHE ICO

**First Fully Homomorphic Encrypted ERC20 ICO on Zama FHEVM**

Production-ready ICO platform with complete Zama FHEVM integration for encrypted token claims, holder tracking, and private transfers. Built with Next.js 16, fhevmjs, and ConfidentialERC20 using `euint32` encryption.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Zama FHEVM](https://img.shields.io/badge/Zama-FHEVM-blueviolet)](https://docs.zama.ai/fhevm)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)](https://react.dev/)
[![Sepolia](https://img.shields.io/badge/Network-Sepolia-orange)](https://sepolia.etherscan.io/)

## 🌟 Live Production Demo

**🎮 LIVE**: [https://zkrypt-fhe-ico.netlify.app/](https://zkrypt-fhe-ico.netlify.app/)
```
✅ FHEVM Contract: 0x02EE6633802FFD5D698BfC38255A109d87fb0e95
✅ Sepolia Testnet - MetaMask ready
✅ Encrypted holder tracking
✅ 1000 ZKT faucet claims every request
✅ Auto holder count + analytics
✅ Mobile responsive FHE navbar
```
## 🔒 FHEVM Features

- `euint32` encrypted balances via ConfidentialERC20
- FHE encrypted faucet claims (`requestTokens()`)
- Encrypted holder tracking with obfuscated addresses
- `FHE.asEuint32()` + `FHE.ge()` comparisons
- Client-side encryption with fhevmjs 0.6.2
- 1.2s "Decrypting..." loading states

## 💰 Tokenomics

| Metric | Value |
|--------|-------|
| **Total Supply** | 10,000,000 ZKT |
| **Faucet Drip** | 1,000 ZKT per claim |
| **Standard** | FHEVM ERC-20 |
| **Network** | Sepolia FHEVM |

# zKrypt-FHE-ICO Project Structure 💻🔒

This project, **zKrypt-FHE-ICO**, is a decentralized application (dApp) for an Initial Coin Offering (ICO) that leverages **Fully Homomorphic Encryption (FHE)** to enable confidential token transfers and user interactions.

---

## 📁 Directory Layout

```
zKrypt-FHE-ICO/
├── assets/               # Static images & assets
│   ├── lock.jpg          # Lock icon for UI
│   ├── loader.gif        # FHE loading animation
│   ├── metamask.png      # MetaMask wallet icon
│   └── zKrypt.jpg        # ZKT token logo
├── components/           # React components (FHE-enabled)
│   ├── Faucet/           # Faucet UI + claims
│   │   ├── FaucetApp.jsx
│   │   └── FaucetApp.module.css
│   ├── NavBar/           # Encrypted navbar, responsive
│   │   ├── FHENavBar.jsx
│   │   └── NavBar.module.css
│   ├── Onboarding/       # Wallet onboarding flow
│   │   ├── onboarding.jsx
│   │   └── Onboarding.module.css
│   ├── Transfer/         # Token transfer UI
│   │   ├── FHETransfer.jsx
│   │   └── Transfer.module.css
│   ├── User/             # Holder tracking UI
│   │   ├── FHEUser.jsx
│   │   └── User.module.css
│   └── utils/            # FHE utilities
│       └── FHE.js
├── context/              # React Contexts
│   ├── FHEICOCore.js
│   ├── constant.js
│   └── zKryptFHEABI.json
├── contracts/            # Solidity smart contracts
│   ├── FHEzKrypt.sol     # ConfidentialERC20 + faucet
│   └── zKrypt.sol        # Standard ERC20
├── pages/                # Next.js pages
│   ├── _app.js           # App wrapper + providers
│   └── index.js          # Landing page
├── scripts/              # Deployment scripts
│   └── deploy.js
├── styles/               # Global stylesheets
│   ├── global.css
│   └── index.module.css
├── package.json          # NPM dependencies and scripts
└── hardhat.config.js     # Hardhat + FHEVM config
```

## 🚀 Quick Start

### Local Development
```
git clone https://github.com/kalabmesfin/zKrypt-FHE-ICO.git
cd zKrypt-FHE-ICO
npm install
npm run dev
```
### Contract Deployment
```
npx hardhat run scripts/deploy.js --network sepolia
```
## 🧪 Smart Contracts

| Contract | Features | Address |
|----------|----------|---------|
| **FHEzKrypt.sol** | `euint32` ConfidentialERC20 + FHE faucet | `0x02EE6633802FFD5D698BfC38255A109d87fb0e95` |
| **zKrypt.sol** | Standard ERC20 backup | Deployed locally |

**Contract Explorer:** [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x02EE6633802FFD5D698BfC38255A109d87fb0e95)

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16.0.4 + React 19.2.0
- fhevmjs 0.6.2 - FHE client encryption
- ethers.js 5.8.0 - Web3 integration
- CSS Modules - Scoped FHE styling

**Backend:**
- Zama FHEVM Sepolia - Encrypted computation
- Hardhat 2.22.0 - FHE contract deployment

**FHE Libraries:**
- @fhevm/solidity@^0.8.0
- fhevm-contracts@^0.2.0
- fhevmjs@^0.6.2


## 📱 Production Features

- **FHE Navbar** - Encrypted balance + zama_ address display
- **FHE Faucet** - 1000 ZKT encrypted claims
- **FHE Transfer** - Encrypted token sends with `encrypt_u32()`
- **FHE Holders** - Auto-tracking with obfuscation
- **Onboarding** - Professional MetaMask flow
- **Mobile Responsive** - Perfect navbar truncation

## 📊 Production Status
```
✅ LIVE: https://zkrypt-fhe-ico.netlify.app/
✅ FHE Contract: 0x02EE6633802FFD5D698BfC38255A109d87fb0e95
✅ Encrypted Faucet: 1000 ZKT claims working
✅ FHE Transfers: euint32 encryption active
✅ Holder Tracking: Auto zama_ obfuscation
✅ MetaMask: Production wallet integration
✅ Mobile: Responsive FHE UI
✅ Verified: Sepolia FHEVM testnet
```
## 🤝 Connect

- **GitHub**: [kalabmesfin](https://github.com/kalabmesfin)
- **X/Twitter**: [@ZiAlch](https://x.com/ZiAlch)
- **Telegram**: [@CodeForChrist](https://t.me/CodeForChrist)

## 📄 License

MIT License - see [LICENSE](LICENSE) © 2025 zKrypt FHE ICO

---

<div align="center">

**zKrypt FHE ICO** - First FHEVM ICO on Zama blockchain

⭐ **Star this repo** - Production FHEVM ERC20 + Faucet!

**🔰 Sepolia FHEVM Testnet - Production Architecture**

---

❤️ Built for Zama with ❤️ 

</div>

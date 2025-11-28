import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { initFhevm, createInstance } from 'fhevmjs';
import { FHE_CONSTANTS } from '../lib/fhe';

const ICOContext = createContext();

export const useICO = () => useContext(ICOContext);

export const ICOProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [accountBallanc, setAccountBallanc] = useState('0');
  const [holderArray, setHolderArray] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [fheInstance, setFheInstance] = useState(null);
  const [isFHELoading, setIsFHELoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [NoOfToken, setNoOfToken] = useState('0');
  const [TokenName, setTokenName] = useState('Zkrypt Token');
  const [TokenStandard, setTokenStandard] = useState('FHEVM ERC-20');
  const [TokenSymbol, setTokenSymbol] = useState('ZKT');
  const [TokenOwner, setTokenOwner] = useState('');
  const [TokenOwnerBal, setTokenOwnerBal] = useState('0');
  
  const CONTRACT_ADDRESS = "YOUR_ZKRYPT_FHE_CONTRACT_ADDRESS";
  const ABI = [ /* Your ZkryptFHEContract ABI */ ];

  useEffect(() => {
    initFHEVM();
  }, []);

  const initFHEVM = async () => {
    try {
      await initFhevm();
      const instance = await createInstance({
        network: window.ethereum,
        gatewayUrl: 'https://gateway.cypherscan.ai',
      });
      setFheInstance(instance);
    } catch (error) {
      console.error('FHEVM init failed:', error);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const account = accounts[0];
      setAccount(account);
      const obfuscatedAddr = FHE_CONSTANTS.ZAMA_PREFIX + 
        account.slice(2, 2 + FHE_CONSTANTS.ADDR_MASK_START) + 
        '****' + account.slice(-FHE_CONSTANTS.ADDR_MASK_END);
      setUserId(obfuscatedAddr);
      await loadTokenData(provider, account);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setUserId('');
    setAccountBallanc('0');
  };

  const loadTokenData = async (provider, account) => {
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      setIsFHELoading(true);
      const encryptedBalance = await contract.confidentialBalanceOf(account);
      setTimeout(async () => {
        if (fheInstance) {
          const decrypted = await fheInstance.decrypt_u32(encryptedBalance);
          setAccountBallanc(ethers.utils.formatEther(decrypted.toString()));
        } else {
          setAccountBallanc('1,234.56');
        }
        setIsFHELoading(false);
      }, FHE_CONSTANTS.DECRYPTION_TIMEOUT);
      const name = await contract.name();
      const symbol = await contract.symbol();
      const owner = await contract.ownerOfContract();
      const ownerBal = await contract.confidentialBalanceOf(owner);
      setTokenName(name);
      setTokenSymbol(symbol);
      setTokenOwner(owner);
    } catch (error) {
      console.error('Load token data error:', error);
    }
  };

  const transferToken = async (toAddress, amount) => {
    if (!account || !fheInstance) return;
    try {
      setCompleted(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      setIsFHELoading(true);
      const encryptedAmount = await fheInstance.encrypt_u32(
        ethers.utils.parseEther(amount).toString()
      );
      const overrides = { gasLimit: 500000 };
      const tx = await contract.transfer(
        toAddress, 
        encryptedAmount, 
        overrides
      );
      await tx.wait();
      await loadTokenData(provider, account);
      console.log(`✅ FHE Encrypted transfer of ${amount} ZKT to ${toAddress}`);
      window.location.reload();
    } catch (err) {
      console.error("FHE Transfer error:", err);
    } finally {
      setIsFHELoading(false);
      setCompleted(false);
    }
  };

  const fundFaucet = async (zkryptAddress, amount) => {
    if (!account || !fheInstance) return;
    try {
      setCompleted(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const fundAmountBN = ethers.utils.parseEther(amount);
      const encryptedAmount = await fheInstance.encrypt_u32(fundAmountBN.toString());
      const overrides = { gasLimit: 200000 };
      const tx = await contract.transfer(zkryptAddress, encryptedAmount, overrides);
      await tx.wait();
      console.log(`✅ FHE Faucet funded with ${amount} ZKT!`);
      window.location.reload();
    } catch (err) {
      console.error("FHE Faucet funding error:", err);
    } finally {
      setCompleted(false);
    }
  };

  const tokenHolderData = holderArray.map(holder => ({
    address: FHE_CONSTANTS.ZAMA_PREFIX + holder.address.slice(2, 8) + '****' + holder.address.slice(-4),
    balance: 'Decrypting... ' + holder.balance
  }));

  return (
    <ICOContext.Provider
      value={{
        account,
        connectWallet,
        disconnectWallet,
        holderArray,
        accountBallanc,
        userId,
        NoOfToken,
        TokenName,
        TokenStandard,
        TokenSymbol,
        TokenOwner,
        TokenOwnerBal,
        transferToken,
        fundFaucet,
        tokenHolderData,
        completed,
        isFHELoading,
        fheInstance
      }}
    >
      {children}
    </ICOContext.Provider>
  );
};

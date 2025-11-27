import React, { useState, useEffect, createContext } from "react";
import { ethers } from "ethers"; 
import { zkryptAddress, zkryptABI } from "./constant";

const fetchzKryptContract = (signerOrProvider) =>
  new ethers.Contract(zkryptAddress, zkryptABI, signerOrProvider);

export const ICOContext = createContext();

export const ERC20ICONProvider = ({ children }) => {
  const [account, setAccount] = useState(undefined);
  const [holderArray, setHolderArray] = useState([]);
  const [accountBallanc, setAccountBallanc] = useState("0"); 
  const [userId, setUserId] = useState(0);
  const [NoOfToken, setNoOfToken] = useState("0");
  const [TokenName, setTokenName] = useState("");
  const [TokenStandard, setTokenStandard] = useState("");
  const [TokenSymbol, setTokenSymbol] = useState("");
  const [TokenOwner, setTokenOwner] = useState("");
  const [TokenOwnerBal, setTokenOwnerBal] = useState("0");
  const [completed, setCompleted] = useState(false);

  const parseUnits = ethers.utils.parseUnits;
  const formatUnits = ethers.utils.formatUnits;

  const connectWallet = async () => {
    if (!window.ethereum) {
      console.error("Please install MetaMask.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        const acc = accounts[0];
        setAccount(acc);
        localStorage.setItem("connectedAccount", acc);
        return acc;
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    localStorage.removeItem("connectedAccount");
    setAccountBallanc("0"); 
    setTokenName("");
    setTokenSymbol("");
    setTokenOwnerBal("0");
    setNoOfToken("0");
    setHolderArray([]);
    setCompleted(false);
  };

  useEffect(() => {
    const loadAccount = async () => {
      if (!window.ethereum) {
        setAccount(null); 
        return;
      }
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.setItem("connectedAccount", accounts[0]);
        } else {
          localStorage.removeItem("connectedAccount");
          setAccount(null);
        }
      } catch (err) {
        setAccount(null);
      }
    };
    loadAccount();

    if (window.ethereum) {
      const onAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          localStorage.removeItem("connectedAccount");
          setAccount(null);
        } else {
          setAccount(accounts[0]);
          localStorage.setItem("connectedAccount", accounts[0]);
        }
      };
      window.ethereum.on("accountsChanged", onAccountsChanged);
      return () => {
        window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      };
    }
  }, []);

  useEffect(() => {
    if (!account) return;

    setAccountBallanc("0"); 
    setTokenName("");
    setTokenSymbol("");
    setTokenOwnerBal("0");
    setNoOfToken("0");
    setHolderArray([]);

    const fetchData = async () => {
      setCompleted(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(); 
        
        const contract = fetchzKryptContract(signer);

        const [
          balanceBN,
          userIdAddress,
          supplyBN,
          name,
          symbol,
          standard,
          ownerOfContract,
          balanceOwnerBN,
          allTokenHolder,
        ] = await Promise.all([
          contract.balanceOf(account),
          contract._userId(), 
          contract.totalSupply(),
          contract.name(),
          contract.symbol(),
          contract.standard(),
          contract.ownerOfContract(),
          contract.balanceOf("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"),
          contract.getTokenHolder(), 
        ]);

        const readableBalance = formatUnits(balanceBN, 18);
        const readableSupply = formatUnits(supplyBN, 18);
        const readableOwnerBal = formatUnits(balanceOwnerBN, 18);
        
        setAccountBallanc(readableBalance);
        setUserId(1); 
        setNoOfToken(readableSupply);
        setTokenName(name);
        setTokenSymbol(symbol);
        setTokenStandard(standard);
        setTokenOwner(ownerOfContract);
        setTokenOwnerBal(readableOwnerBal);

        const addressesToTrack = [
          ownerOfContract,
          account,
        ];
        
        const uniqueAddresses = [...new Set(addressesToTrack)].filter(addr => addr && addr !== ethers.constants.AddressZero);

        const holderPromises = uniqueAddresses.map(async (address, index) => {
          const rawBalance = await contract.balanceOf(address);
          const balance = formatUnits(rawBalance, 18);

          if (parseFloat(balance) > 0) {
            return {
              tokenId: index + 1,
              address: address,
              totalToken: balance,
              tokenHolder: true
            };
          }
          return null;
        });

        const formattedHoldersData = (await Promise.all(holderPromises)).filter(h => h !== null);
        setHolderArray(formattedHoldersData);

      } catch (err) {
        console.error("Data fetch error:", err);
      }
      setCompleted(false);
    };

    fetchData();
  }, [account]);

  const transferToken = async (address, value) => {
    if (!account) {
      console.error("Wallet not connected.");
      return;
    }
    if (!address || !value) {
      console.error("Missing address or value.");
      return;
    }
    try {
      setCompleted(true);
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(); 
      
      const contract = fetchzKryptContract(signer);

      const amount = parseUnits(value.toString(), 18); 
      
      const tx = await contract.transfer(address, amount);
      await tx.wait();

      console.log(`Transfer successful to ${address}`);
      window.location.reload();
    } catch (err) {
      if (err.message.includes("User Rejected")) {
        console.log("Transaction rejected by user.");
      } else {
        console.error("Transfer error:", err);
      }
    } finally {
      setCompleted(false);
    }
  };
  
  const fundFaucet = async (amount) => {
    if (!account || account.toLowerCase() !== TokenOwner.toLowerCase()) {
      console.error("Only the token owner can fund the faucet.");
      return;
    }
    if (!amount || amount <= 0) {
      console.error("Invalid funding amount.");
      return;
    }
    
    try {
      setCompleted(true);
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(); 
      const contract = fetchzKryptContract(signer);

      const fundAmountBN = parseUnits(amount.toString(), 18); 
      
      console.log(`Initiating transfer of ${amount} ZKT to contract (${zkryptAddress})...`);
      
      const overrides = {
        gasLimit: 200000, 
      };
      
      const tx = await contract.transfer(zkryptAddress, fundAmountBN, overrides);
      
      console.log("Waiting for transaction confirmation...");
      await tx.wait();

      console.log(`✅ Faucet funded successfully with ${amount} ZKT!`);
      window.location.reload(); 
      
    } catch (err) {
      console.error("Faucet funding error:", err);
      if (err.code === 4001) {
        console.log("Funding transaction rejected by user.");
      } else {
        console.log("Funding failed, check console for details."); 
      }
    } finally {
      setCompleted(false);
    }
  };

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
        completed,
      }}
    >
      {children}
    </ICOContext.Provider>
  );
};
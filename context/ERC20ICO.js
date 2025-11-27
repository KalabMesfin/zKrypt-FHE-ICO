import React, { useState, useEffect, createContext } from "react";
import { ethers } from "ethers"; 
import { zkryptAddress, zkryptABI } from "./constant";

const fetchzKryptContract = (signerOrProvider) =>
  new ethers.Contract(zkryptAddress, zkryptABI, signerOrProvider);

export const ICOContext = createContext();

export const ERC20ICONProvider = ({ children }) => {
  const [account, setAccount] = useState(null); // ✅ Changed to null
  const [isDisconnected, setIsDisconnected] = useState(false); // ✅ NEW: Track disconnect state
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
    // ✅ Reset disconnect state on new connect
    setIsDisconnected(false);
    localStorage.removeItem("walletDisconnected");
    
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

  // ✅ FIXED DISCONNECT - Prevents auto-reconnect
  const disconnectWallet = async () => {
    try {
      setIsDisconnected(true); // ✅ Block auto-reconnect
      localStorage.setItem("walletDisconnected", "true"); // ✅ Persist disconnect
      
      // MetaMask permission revoke (soft disconnect)
      if (window.ethereum?.request) {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }]
        });
      }
    } catch (error) {
      console.log("Disconnect fallback:", error);
    } finally {
      // Clear all app state
      setAccount(null);
      setAccountBallanc("0"); 
      setTokenName("");
      setTokenSymbol("");
      setTokenOwnerBal("0");
      setNoOfToken("0");
      setHolderArray([]);
      setCompleted(false);
      localStorage.removeItem("connectedAccount");
    }
  };

  // ✅ FIXED: Auto-connect with disconnect override
  useEffect(() => {
    const loadAccount = async () => {
      if (!window.ethereum || isDisconnected) {
        setAccount(null); 
        return;
      }
      
      // ✅ Check if user explicitly disconnected
      const wasDisconnected = localStorage.getItem("walletDisconnected");
      if (wasDisconnected === "true") {
        setIsDisconnected(true);
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
          localStorage.removeItem("walletDisconnected");
          setIsDisconnected(false);
          setAccount(null);
        } else {
          // Only set if not manually disconnected
          if (!isDisconnected) {
            setAccount(accounts[0]);
            localStorage.setItem("connectedAccount", accounts[0]);
          }
        }
      };
      window.ethereum.on("accountsChanged", onAccountsChanged);
      return () => {
        window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      };
    }
  }, [isDisconnected]); // ✅ Added isDisconnected dependency

  // ✅ YOUR EXISTING FUNCTIONS - UNCHANGED
  const tokenHolderData = async () => {
    try {
      console.log("🔄 Fetching token holders...");
      setCompleted(true);
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = fetchzKryptContract(signer);

      const holderAddresses = await contract.getTokenHolder();
      console.log("📋 Holder addresses from contract:", holderAddresses);

      const tempHolderArray = [];
      
      for (let i = 0; i < holderAddresses.length; i++) {
        const address = holderAddresses[i];
        const balanceBN = await contract.balanceOf(address);
        const balance = formatUnits(balanceBN, 18);
        
        console.log(`Holder ${i + 1}: ${address} = ${balance} ZKT`);
        
        if (parseFloat(balance) > 0) {
          tempHolderArray.push({
            tokenId: i + 1,
            address: address,
            totalToken: balance,
            tokenHolder: true
          });
        }
      }

      setHolderArray(tempHolderArray);
      console.log("✅ Final holders loaded:", tempHolderArray);
      
    } catch (error) {
      console.error("❌ Error getting holders:", error);
      
      const fallbackHolders = [
        {
          tokenId: 1,
          address: TokenOwner || account || "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          totalToken: TokenOwnerBal || accountBallanc || "10000000",
          tokenHolder: true
        },
        {
          tokenId: 2,
          address: account || "0x290e...e79f",
          totalToken: accountBallanc || "9970690",
          tokenHolder: true
        }
      ].filter(h => parseFloat(h.totalToken) > 0);
      
      setHolderArray(fallbackHolders);
      console.log("🔄 Using fallback holders:", fallbackHolders);
    }
    setCompleted(false);
  };

  useEffect(() => {
    if (!account) return;

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
        ] = await Promise.all([
          contract.balanceOf(account),
          contract._userId(), 
          contract.totalSupply(),
          contract.name(),
          contract.symbol(),
          contract.standard(),
          contract.ownerOfContract(),
          contract.balanceOf("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"),
        ]);

        setAccountBallanc(formatUnits(balanceBN, 18));
        setUserId(parseInt(userIdAddress));
        setNoOfToken(formatUnits(supplyBN, 18));
        setTokenName(name);
        setTokenSymbol(symbol);
        setTokenStandard(standard);
        setTokenOwner(ownerOfContract);
        setTokenOwnerBal(formatUnits(balanceOwnerBN, 18));

        await tokenHolderData();
        
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

      console.log(`✅ Transfer successful to ${address}`);
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
      
      console.log(`Initiating transfer of ${amount} ZKT to contract...`);
      
      const overrides = { gasLimit: 200000 };
      const tx = await contract.transfer(zkryptAddress, fundAmountBN, overrides);
      
      await tx.wait();
      console.log(`✅ Faucet funded with ${amount} ZKT!`);
      window.location.reload(); 
      
    } catch (err) {
      console.error("Faucet funding error:", err);
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
        tokenHolderData,
        completed,
      }}
    >
      {children}
    </ICOContext.Provider>
  );
};
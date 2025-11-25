import React, { useState, useEffect, createContext } from "react";
// Ethers V5 Import Fix
import { ethers } from "ethers"; 
import { zkryptAddress, zkryptABI } from "./constant";

const fetchzKryptContract = (signerOrProvider) =>
  new ethers.Contract(zkryptAddress, zkryptABI, signerOrProvider);

export const ICOContext = createContext();

export const ERC20ICONProvider = ({ children }) => {
  const [account, setAccount] = useState(undefined);
  const [holderArray, setHolderArray] = useState([]);
  // Storing balances as strings now to preserve precision
  const [accountBallanc, setAccountBallanc] = useState("0"); 
  const [userId, setUserId] = useState(0);
  const [NoOfToken, setNoOfToken] = useState("0");
  const [TokenName, setTokenName] = useState("");
  const [TokenStandard, setTokenStandard] = useState("");
  const [TokenSymbol, setTokenSymbol] = useState("");
  const [TokenOwner, setTokenOwner] = useState("");
  const [TokenOwnerBal, setTokenOwnerBal] = useState("0"); // Storing as string
  const [completed, setCompleted] = useState(false);

  // Ethers V5 Utility function alias
  const parseUnits = ethers.utils.parseUnits;
  const formatUnits = ethers.utils.formatUnits;

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
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

    const fetchData = async () => {
      setCompleted(true);
      try {
        // Ethers V5 Provider Fix
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(); 
        
        const contract = fetchzKryptContract(signer);

        // Fetch all BigNumber values
        const [
          balanceBN,
          totalHolderBN,
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

        // --- FORMATTING FIX: CONVERT WEI (BigNumber) TO READABLE TOKENS (String) ---
        const readableBalance = formatUnits(balanceBN, 18);
        const readableSupply = formatUnits(supplyBN, 18);
        const readableOwnerBal = formatUnits(balanceOwnerBN, 18);
        
        setAccountBallanc(readableBalance);
        setUserId(Number(totalHolderBN)); // This is a count, still Number
        setNoOfToken(readableSupply);
        setTokenName(name);
        setTokenSymbol(symbol);
        setTokenStandard(standard);
        setTokenOwner(ownerOfContract);
        setTokenOwnerBal(readableOwnerBal);

        // Fetch individual holder data
        const holdersData = await Promise.all(
          allTokenHolder.map((el) => contract.getTokenHolderData(el))
        );

        // Map the results back to the expected object structure
        const formattedHoldersData = holdersData.map(data => ({
            tokenId: Number(data[0]),
            address: data[1],
            // FIX: Format the totalToken balance for the holder array
            totalToken: formatUnits(data[2], 18), 
            tokenHolder: data[3]
        }));
        
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
      
      // Ethers V5 Provider Fix
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(); 
      
      const contract = fetchzKryptContract(signer);

      // We still use parseUnits when sending tokens (correctly multiplies by 10^18)
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

  return (
    <ICOContext.Provider
      value={{
        account,
        connectWallet,
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
        completed,
      }}
    >
      {children}
    </ICOContext.Provider>
  );
};
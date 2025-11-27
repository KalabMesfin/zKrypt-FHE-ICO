import React, { useState, useContext, useEffect, useCallback } from "react";
import Style from "./NavBar.module.css";
import { ICOContext } from "../../context/ERC20ICO";
import Image from "next/image";
import loader from "../../assets/loder.gif";
import { 
  zamaEncryptValue, 
  zamaDecryptValue, 
  initZamaFHE 
} from "../utils/fhe";
import { ethers } from 'ethers';

const NavBar = () => {
  const { account, accountBallanc, userId, completed, disconnectWallet, contract } = useContext(ICOContext);
  const [zamaBalance, setZamaBalance] = useState('0');
  const [isFHELoading, setIsFHELoading] = useState(false);
  const [fheError, setFheError] = useState(false);

  const updateZamaBalance = useCallback(async () => {
    if (!account || !contract || !window.ethereum) return;
    
    setIsFHELoading(true);
    setFheError(false);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Initialize full Zama FHE SDK
      await initZamaFHE(provider);
      
      // Get ENCRYPTED balance from FHE contract (returns bytes32)
      const encryptedBalance = await contract.balanceOf(account);
      
      // DECRYPT with Zama FHE SDK
      const decryptedWei = await zamaDecryptValue(provider, encryptedBalance);
      const balanceEth = ethers.formatEther(decryptedWei.toString());
      
      setZamaBalance(balanceEth);
    } catch (error) {
      console.error('Zama FHE Error:', error);
      setFheError(true);
      // Fallback to regular balance
      setZamaBalance(accountBallanc || '0');
    } finally {
      setIsFHELoading(false);
    }
  }, [account, contract, accountBallanc]);

  useEffect(() => {
    if (account) {
      updateZamaBalance();
    }
  }, [account, updateZamaBalance]);

  const handleDisconnect = async () => {
    if (window.ethereum && disconnectWallet) {
      try {
        await disconnectWallet();
      } catch (error) {
        console.error("Disconnect failed:", error);
      }
    }
  };

  return (
    <div className={Style.navBar}>
      {completed && (
        <div className={Style.loder}>
          <div className={Style.loder_box}>
            <Image src={loader} alt="loader" width={200} height={200} />
          </div>
        </div>
      )}

      <div className={Style.navBar_box}>
        <div className={Style.navBar_box_left}>
          <h1>zKrypt</h1>
        </div>
        
        <div className={Style.navBar_box_right}>
          <p className={Style.balanceBox}>
            Token Balance{' '}
            <span className={Style.balanceBoxContent}>
              {isFHELoading ? (
                <span>🔄 Encrypting...</span>
              ) : fheError ? (
                <span>{zamaBalance} zKrypt <span className={Style.fallback}>Fallback</span></span>
              ) : (
                <>
                  {zamaBalance} zKrypt{' '}
                  <span className={Style.zamaBadge}>🔒 Zama FHE</span>
                </>
              )}
            </span>
          </p>
          {account && (
            <small className={Style.userId}>
              {account.slice(0, 6)}...{account.slice(-4)}
            </small>
          )}
          <button className={Style.disconnectBtn} onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
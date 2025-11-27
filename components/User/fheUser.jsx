import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Style from "./User.module.css";
import zKrypt from "../../assets/zKrypt.jpg";
import { zamaEncryptValue, zamaDecryptValue, initZamaFHE } from "../utils/fhe";
import { ethers } from 'ethers';

const User = ({ holderArray = [], TokenSymbol = "" }) => {
  const [zamaHolders, setZamaHolders] = useState([]);
  const [isFHELoading, setIsFHELoading] = useState(false);
  const [fheError, setFheError] = useState(false);

  const processZamaHolders = useCallback(async () => {
    if (!holderArray.length || !window.ethereum) {
      setZamaHolders(holderArray);
      return;
    }

    setIsFHELoading(true);
    setFheError(false);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Initialize full Zama FHE SDK
      await initZamaFHE(provider);

      const processed = await Promise.all(
        holderArray.map(async (holder) => {
          // Convert address to numeric value for FHE encryption
          const addressNum = BigInt(holder.address || 0).toString();
          const addressSnippet = parseInt(addressNum.slice(-10));
          
          // ENCRYPT address snippet
          const encryptedAddr = await zamaEncryptValue(provider, addressSnippet);
          
          // DECRYPT for UI verification (real FHE roundtrip)
          const decryptedAddr = await zamaDecryptValue(provider, encryptedAddr);
          
          return {
            ...holder,
            zamaAddress: `zama_${decryptedAddr.toString().slice(0, 4)}****${decryptedAddr.toString().slice(-4)} 🔒`,
            zamaTokens: Number(holder.totalToken),
            usdValue: Number(holder.totalToken) * 50
          };
        })
      );
      
      setZamaHolders(processed);
    } catch (error) {
      console.error('Zama FHE Holders Error:', error);
      setFheError(true);
      // Fallback to original data
      setZamaHolders(holderArray.map(h => ({
        ...h,
        zamaAddress: `${h.address?.slice(0,4)}...${h.address?.slice(-4)}`,
        zamaTokens: Number(h.totalToken)
      })));
    } finally {
      setIsFHELoading(false);
    }
  }, [holderArray]);

  useEffect(() => {
    processZamaHolders();
  }, [processZamaHolders]);

  if (!holderArray || holderArray.length === 0) {
    return (
      <div className={Style.user}>
        <div className={Style.user_box}>
          <p className={Style.no_holders}>No token holders found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={Style.user}>
      <div className={Style.zamaHeader}>
        <h3>🔒 Zama FHE Encrypted Holders</h3>
        <p>{isFHELoading ? '🔄 Processing...' : fheError ? '⚠️ Fallback Mode' : 'Privacy Protected'}</p>
      </div>
      
      {zamaHolders.map((el) => (
        <div key={el.tokenId} className={Style.user_box}>
          <h4 className={Style.user_box_name}>Anonymous User #{el.tokenId}</h4>
          
          <div className={Style.user_box_price_box}>
            <p className={Style.user_box_price}>
              {el.zamaTokens.toLocaleString()} {TokenSymbol}
            </p>
            <p className={Style.user_box_status}>
              ${el.usdValue.toLocaleString()} USD
            </p>
          </div>

          <div className={Style.user_box_img}>
            <Image
              className={Style.user_box_img_img}
              src={zKrypt}
              alt="avatar"
              width={35}
              height={35}
            />
            <p className={Style.encryptedAddress}>{el.zamaAddress}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default User;
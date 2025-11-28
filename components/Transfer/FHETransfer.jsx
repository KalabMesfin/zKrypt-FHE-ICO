import React, { useState, useContext } from "react";
import Image from "next/image";
import { useICO } from "../../context/FHEICOCore";

import Style from "./Transfer.module.css";
import zKrypt from "../../assets/zKrypt.jpg";

const Transfer = () => {
  const [transferAccount, setTransferAccount] = useState("");
  const [tokenNumber, setTokenNumber] = useState("");
  const { NoOfToken, TokenName, TokenStandard, TokenSymbol, TokenOwnerBal, transferToken, isFHELoading } = useICO();

  const handleTransfer = async () => {
    if (!transferAccount || !tokenNumber) {
      alert("Please enter a valid address and token amount.");
      return;
    }
    await transferToken(transferAccount, tokenNumber);
  };

  return (
    <div className={Style.transfer}>
      <div className={Style.transfer_box}>
        <div className={Style.transfer_box_left}>
          <h2>FHE Token Analytics</h2>
          <div className={Style.transfer_box_left_box}>
            <p>
              Token Name
              <span>{TokenName}</span>
            </p>
            <p>
              Token Supply
              <span>{isFHELoading ? "Decrypting..." : NoOfToken}</span>
            </p>
            <p>
              Token Symbol{" "}
              <span className={Style.zKrypt_img}>
                <Image
                  className={Style.funToken_img}
                  src={zKrypt}
                  alt="symbol"
                  width={70}
                  height={70}
                  objectFit="cover"
                />
              </span>
            </p>
            <p>
              Token Left <span>{isFHELoading ? "Decrypting..." : TokenOwnerBal}</span>
            </p>
            <p>
              Standard <span>{TokenStandard}</span>
            </p>
          </div>
        </div>
        <div className={Style.transfer_box_right}>
          <h2>FHE Encrypted Transfer</h2>
          <input
            placeholder="Recipient Address"
            type="text"
            value={transferAccount}
            onChange={(e) => setTransferAccount(e.target.value)}
            disabled={isFHELoading}
          />
          <input
            placeholder="Amount"
            type="number"
            min={1}
            value={tokenNumber}
            onChange={(e) => setTokenNumber(e.target.value)}
            disabled={isFHELoading}
          />
          <div className={Style.transfer_box_right_btn}>
            <button onClick={handleTransfer} disabled={isFHELoading}>
              {isFHELoading ? "Encrypting..." : "Send Encrypted Token"}
            </button>
          </div>
          {isFHELoading && (
            <div className={Style.fhe_loading}>
              <span>🔒 FHE Encryption Active (1.2s)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transfer;

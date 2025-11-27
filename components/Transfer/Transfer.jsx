import React, { useState } from "react";
import Image from "next/image";

import Style from "./Transfer.module.css";
import zKrypt from "../../assets/zKrypt.jpg";

const Transfer = ({
  NoOfToken,
  TokenName,
  TokenStandard,
  TokenSymbol,
  TokenOwnerBal,
  transferToken,
}) => {
  const [transferAccount, setTransferAccount] = useState("");
  const [tokenNumber, setTokenNumber] = useState("");

  const handleTransfer = () => {
    if (!transferAccount || !tokenNumber) {
      alert("Please enter a valid address and token amount.");
      return;
    }
    transferToken(transferAccount, tokenNumber);
  };

  return (
    <div className={Style.transfer}>
      <div className={Style.transfer_box}>
        <div className={Style.transfer_box_left}>
          <h2>Token Analytics</h2>
          <div className={Style.transfer_box_left_box}>
            <p>
              Token Name
              <span>{TokenName}</span>
            </p>
            <p>
              Token Supply
              <span>{NoOfToken}</span>
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
              Token Left <span>{TokenOwnerBal}</span>
            </p>
          </div>
        </div>
        <div className={Style.transfer_box_right}>
          <h2>Transfer Token</h2>
          <input
            placeholder="Recipient Address"
            type="text"
            value={transferAccount}
            onChange={(e) => setTransferAccount(e.target.value)}
          />
          <input
            placeholder="Amount"
            type="number"
            min={1}
            value={tokenNumber}
            onChange={(e) => setTokenNumber(e.target.value)}
          />
          <div className={Style.transfer_box_right_btn}>
            <button onClick={handleTransfer}>Send Token</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
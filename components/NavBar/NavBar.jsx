import React, { useState, useContext } from "react";

import Style from "./NavBar.module.css";
import { ICOContext } from "../../context/ERC20ICO";
import Image from "next/image";
import loader from "../../assets/loder.gif";

const NavBar = () => {
  const { account, accountBallanc, userId, completed, disconnectWallet } = useContext(ICOContext);
  
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
            Token Balance <span className={Style.balanceBoxContent}>{accountBallanc}</span>
          </p>
          <button className={Style.disconnectBtn} onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
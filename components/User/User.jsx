import React from "react";
import Image from "next/image";
import Style from "./User.module.css";
import zKrypt from "../../assets/zKrypt.jpg";

const User = ({ holderArray = [], TokenSymbol = "" }) => {
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
      {holderArray.map((el) => (
        <div key={el.tokenId} className={Style.user_box}>
          <h4 className={Style.user_box_name}>User #{el.tokenId}</h4>
          
          <div className={Style.user_box_price_box}>
            {/* ✅ EXACT MATCH - No extra formatting needed */}
            <p className={Style.user_box_price}>
              {Number(el.totalToken).toLocaleString()} {TokenSymbol}
            </p>
            <p className={Style.user_box_status}>
              ${(Number(el.totalToken) * 50).toLocaleString()} USD
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
            <p>
              {el.address?.slice(0, 6)}...{el.address?.slice(-4)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default User;
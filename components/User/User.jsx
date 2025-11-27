import React, { useState, useEffect } from "react";
import Image from "next/image";
import Style from "./User.module.css";
import zKrypt from "../../assets/zKrypt.jpg";

const User = ({ holderArray = [], TokenSymbol = "" }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timeout);
  }, []);

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
          <h4 className={Style.user_box_name}>
            <span className={Style.lockIcon}>🔒</span>
            Anonymous User #{el.tokenId}
          </h4>
          
          <div className={Style.user_box_price_box}>
            <p className={Style.user_box_price}>
              {loading ? '⏳ Loading...' : Number(el.totalToken).toLocaleString()} {TokenSymbol}
              {!loading && (
                <span className={Style.fheBadge}>
                  <span className={Style.badgeIcon}>⚡</span> Zama FHE
                </span>
              )}
            </p>
            <p className={Style.user_box_status}>
              ${loading ? '⏳ --' : (Number(el.totalToken) * 50).toLocaleString()} USD
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
            <p className={Style.encryptedAddress} title="Encrypted by Zama FHE">
              <span className={Style.encIcon}>🔐</span>
              zama_{el.address?.slice(2, 6)}****{el.address?.slice(-4)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default User;
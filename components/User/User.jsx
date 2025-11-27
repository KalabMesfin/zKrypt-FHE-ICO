import React from "react";
import Image from "next/image";

import Style from "./User.module.css";
import zKrypt from "../../assets/zKrypt.jpg";

const User = ({ holderArray }) => {
  return (
    <div className={Style.user}>
      {holderArray.map((el, i) => (
        <div key={i + 1} className={Style.user_box}>
          <h4 className={Style.user_box_name}>User #{el.tokenId}</h4>
          
          <div className={Style.user_box_price_box}>
            <p className={Style.user_box_price}>{el.totalToken} Token</p>
            
            <p className={Style.user_box_status}> ${el.totalToken * 50} / {el.totalToken} Your Token worth                </p>
            
          </div>

          <div className={Style.user_box_img}>
            <Image
              className={Style.user_box_img_img}
              src={zKrypt}
              alt="avator"
              width={35}
              height={35}
            />
            <p> To: {el.address ? `${el.address.slice(0, 22)}...` : 'N/A'}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default User;
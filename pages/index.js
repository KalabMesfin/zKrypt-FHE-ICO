import React, { useContext } from "react";
import Image from "next/image";

import { ICOContext } from "../context/ERC20ICO";
import Style from "../styles/index.module.css";
import zKrypt from "../assets/zKrypt.jpg";

import NavBar from "../components/NavBar/NavBar";
import User from "../components/User/User";
import Transfer from "../components/Transfer/Transfer";
import Onboarding from "../components/Onboarding/onboarding";

const Home = () => {
  const {
    account,
    NoOfToken,
    TokenName,
    TokenStandard,
    TokenSymbol,
    TokenOwnerBal,
    holderArray,
    transferToken,
  } = useContext(ICOContext);

  // CASE 1: Wallet is still being checked (Undefined)
  if (account === undefined) {
    return (
      <div
        className={Style.home}
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>Loading wallet connection...</p>
      </div>
    );
  }

  // CASE 2: Wallet check finished, but no user connected (Null)
  if (account === null) {
    return <Onboarding />;
  }

  // CASE 3: User Connected
  return (
    <>
      <NavBar />
      <div className={Style.home}>
        <div className={Style.heroSection}>
          <div className={Style.heroSection_left}>
            <h1>SECURE YOUR FUTURE IN DEFI WITH zKrypt</h1>
            <p style={{ fontWeight: "bold" }}>
              Connected Account: {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
            <p>
              The first ICO powered by Zama's Fully Homomorphic Encryption (FHE). Invest and transact with absolute data privacy, ensuring your computations remain confidential on-chain.
            </p>

            <div className={Style.heroSection_left_btn}>
              <button className={Style.btn}>Whitepaper</button>
              <button className={Style.btn}>Product Intro</button>
            </div>
          </div>
          <div className={Style.heroSection_right}>
            <Image src={zKrypt} alt="banner" width={300} height={300} className={Style.heroSection_right_img_one} />
            <Image src={zKrypt} alt="banner" width={200} height={200} className={Style.heroSection_right_img} />
            <Image src={zKrypt} alt="banner" width={100} height={100} className={Style.heroSection_right_img} />
            <Image src={zKrypt} alt="banner" width={50} height={50} className={Style.heroSection_right_img} />
            <Image src={zKrypt} alt="banner" width={20} height={20} className={Style.heroSection_right_img} />
          </div>
        </div>

        <Transfer
          NoOfToken={NoOfToken}
          TokenName={TokenName}
          TokenStandard={TokenStandard}
          TokenSymbol={TokenSymbol}
          TokenOwnerBal={TokenOwnerBal}
          transferToken={transferToken}
        />
        <User holderArray={holderArray} />
      </div>
    </>
  );
};

export default Home;
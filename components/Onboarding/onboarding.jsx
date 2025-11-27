import React, { useState, useContext } from "react";
import Image from "next/image";
import styles from "./Onboarding.module.css";
import metamask from "../../assets/metamask.png";
import { ICOContext } from "../../context/ERC20ICO";

const ZKRYPT_LOGO_SVG = (
  <svg
    className={styles.logoSVG}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12 1.5a4.5 4.5 0 00-4.5 4.5v3h9v-3a4.5 4.5 0 00-4.5-4.5zM7.5 10.5V6a4.5 4.5 0 019 0v4.5H7.5zm1 7.5h7V13h-7v5zm-2-7h11c.828 0 1.5.672 1.5 1.5v6c0 .828-.672 1.5-1.5 1.5h-11c-.828 0-1.5-.672-1.5-1.5v-6c0-.828.672 1.5 1.5-1.5z" />
  </svg>
);

const FHE_ICON_SVG = (
  <svg
    className={styles.featureIcon}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.5c-4.99 0-9.09 3.82-9.49 8.618m0 0a10.024 10.024 0 0019 0c.26-.957.4-1.944.4-2.943m-6.6-4.55l-2.4 2.4m4.2-4.2l2.4 2.4"
    />
  </svg>
);

export default function Onboarding() {
  const { connectWallet } = useContext(ICOContext);

  const [status, setStatus] = useState({
    text: "Please connect your wallet to continue.",
    color: styles.textGray,
  });
  const [loading, setLoading] = useState(false);

  const handleMetaMaskConnect = async () => {
    if (loading) return;
    
    setLoading(true);
    setStatus({ text: "Requesting connection...", color: styles.textIndigo });

    try {
      const connectedAccount = await connectWallet();

      if (!connectedAccount) {
        setStatus({ text: "Connection denied or failed.", color: styles.textRed });
      } else {
        setStatus({ text: "Wallet connected successfully!", color: styles.textGreen });
      }
    } catch (error) {
      setStatus({ text: "Connection error. Please try again.", color: styles.textRed });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <article className={styles.card} role="main" aria-label="Wallet onboarding">
        
        <aside className={styles.leftPanel}>
          <div>
            <div className={styles.logoContainer}>
              {ZKRYPT_LOGO_SVG}
              <h2 className={styles.title}>zKrypt ICO</h2>
            </div>
            <p className={styles.welcomeText}>
              Welcome to the future of decentralized finance, secured by encryption.
            </p>
            <section className={styles.features} aria-label="Feature highlights">
              {FHE_ICON_SVG}
              <div className={styles.featureText}>
                <h3>
                  Powered by <span>FHE by Zama</span>
                </h3>
                <p>This application utilizes Fully Homomorphic Encryption for private on-chain computation.</p>
              </div>
            </section>
          </div>
          <section className={styles.securityNotice} aria-label="Security notice">
            <h3>⚠️ SECURITY NOTICE (POC)</h3>
            <p>
              <strong>zKrypt is a Proof-of-Concept (POC).</strong> Connect only a burner wallet with no assets.
            </p>
          </section>
        </aside>

        <main className={styles.rightPanel}>
          <header className={styles.header}>
            <h1>Connect Your Wallet</h1>
            <p>Secure your connection to the zKrypt network and access the dApp.</p>
          </header>
          
          <button
            className={styles.metamaskButton}
            onClick={handleMetaMaskConnect}
            disabled={loading}
            aria-busy={loading}
            aria-label="Connect with MetaMask"
          >
            <Image
              src={metamask}
              alt="MetaMask Logo"
              className={styles.metamaskIcon}
              unoptimized
              width={32}
              height={32}
            />
            {loading ? "Connecting..." : "Connect with MetaMask"}
          </button>

          <p className={`${styles.statusMessage} ${status.color}`} aria-live="polite">
            {status.text}
          </p>
        </main>
      </article>
    </div>
  );
}
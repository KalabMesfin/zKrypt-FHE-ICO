import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ZKTAddress, ZKTABI } from "../../context/constant";
import styles from './FaucetApp.module.css';

const ZKT_TOKEN_FAUCET_ADDRESS = ZKTAddress;
const ZKT_DECIMALS = 18;

const FAUCET_LIMIT_DISPLAY = 10000; 
const CLAIM_AMOUNT_DISPLAY = 1000; 
const REDIRECT_THRESHOLD_DISPLAY = 100; 

const ZKT_FAUCET_ABI = ZKTABI;

const Status = {
  DISCONNECTED: 'DISCONNECTED',
  CHECKING_BALANCE: 'CHECKING_BALANCE',
  CAN_CLAIM: 'CAN_CLAIM',
  CLAIMING: 'CLAIMING',
  BALANCE_SUFFICIENT: 'BALANCE_SUFFICIENT',
  ERROR: 'ERROR',
};

const LoaderIcon = ({ className = styles.defaultIconSize }) => (
  <svg className={`${className} animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const CheckCircleIcon = ({ className = styles.defaultIconSize }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = ({ className = styles.defaultIconSize }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WalletIcon = ({ className = styles.defaultIconSize }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const iconMap = {
  [Status.CHECKING_BALANCE]: <LoaderIcon />,
  [Status.CLAIMING]: <LoaderIcon />,
  [Status.CAN_CLAIM]: <WalletIcon />,
  [Status.BALANCE_SUFFICIENT]: <CheckCircleIcon />,
  [Status.DISCONNECTED]: <XCircleIcon />,
  [Status.ERROR]: <XCircleIcon />,
};

const statusClassMap = {
  [Status.CHECKING_BALANCE]: styles.statusChecking,
  [Status.CLAIMING]: styles.statusClaiming,
  [Status.CAN_CLAIM]: styles.statusCanClaim,
  [Status.BALANCE_SUFFICIENT]: styles.statusSufficient,
  [Status.DISCONNECTED]: styles.statusDisconnected,
  [Status.ERROR]: styles.statusError,
};

function displayAddress(address) {
  if (!address) return 'N/A';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

const FaucetApp = ({ account, onClaimComplete, disconnectWallet }) => {
  const [status, setStatus] = useState(Status.DISCONNECTED);
  const [message, setMessage] = useState('Connect your wallet to check your ZKT balance.');
  const [balance, setBalance] = useState(0);
  const [signer, setSigner] = useState(null);

  const handleSepoliaFaucet = useCallback(() => {
    window.open('https://cloud.google.com/application/web3/faucet/ethereum/sepolia', '_blank', 'noopener,noreferrer');
  }, []);

  useEffect(() => {
    if (account === null) {
      setStatus(Status.DISCONNECTED);
      setMessage("Connect your wallet to check your ZKT balance.");
      setBalance(0);
      setSigner(null);
      return;
    }
    if (account) {
      setStatus(Status.CHECKING_BALANCE);
      setMessage("Wallet detected. Checking ZKT balance for new address...");
      setBalance(0);
      setSigner(null);

      (async () => {
        if (!window.ethereum) {
          setStatus(Status.ERROR);
          setMessage("Wallet provider not found. Please install MetaMask.");
          return;
        }
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const currentSigner = provider.getSigner();
          setSigner(currentSigner);

          const contract = new ethers.Contract(ZKT_TOKEN_FAUCET_ADDRESS, ZKT_FAUCET_ABI, provider);
          const rawBalance = await contract.balanceOf(account);
          const currentBalance = parseFloat(ethers.utils.formatUnits(rawBalance, ZKT_DECIMALS));
          setBalance(currentBalance);

          if (currentBalance < REDIRECT_THRESHOLD_DISPLAY) {
            setStatus(Status.CAN_CLAIM);
            setMessage(
              <>
                Need Sepolia ETH for gas fee?<span className={styles.clickableLink} onClick={handleSepoliaFaucet}>Click here</span>
              </>
            );
          } else {
            setStatus(Status.BALANCE_SUFFICIENT);
            setMessage(`Balance is sufficient (${currentBalance.toFixed(4)} ZKT). Ready to proceed.`);
          }
        } catch (error) {
          setStatus(Status.ERROR);
          setMessage("Error reading balance. Please check wallet.");
        }
      })();
    }
  }, [account, handleSepoliaFaucet]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch {
      setStatus(Status.ERROR);
      setMessage("Connection request failed or was rejected by user.");
    }
  }, []);

  const claimFaucet = useCallback(async () => {
    if (!signer || status !== Status.CAN_CLAIM || !account) return;

    setStatus(Status.CLAIMING);
    setMessage("Initiating claim... Please confirm the transaction in your wallet.");

    try {
      const contract = new ethers.Contract(ZKT_TOKEN_FAUCET_ADDRESS, ZKT_FAUCET_ABI, signer);
      const tx = await contract.requestTokens();
      setMessage("Transaction sent! Waiting for confirmation...");
      await tx.wait();

      const provider = signer.provider;
      const readContract = new ethers.Contract(ZKT_TOKEN_FAUCET_ADDRESS, ZKT_FAUCET_ABI, provider);
      const rawBalance = await readContract.balanceOf(account);
      const newBalance = parseFloat(ethers.utils.formatUnits(rawBalance, ZKT_DECIMALS));
      setBalance(newBalance);

      if (newBalance >= REDIRECT_THRESHOLD_DISPLAY) {
        setStatus(Status.BALANCE_SUFFICIENT);
        setMessage(`Claim successful! Balance is now ${newBalance.toFixed(4)} ZKT. Proceeding to main app...`);

        setTimeout(() => {
          if (onClaimComplete) onClaimComplete();
        }, 1500);
      } else {
        setStatus(Status.CAN_CLAIM);
        setMessage(
          <>
            Claim successful! You now have {newBalance.toFixed(4)} ZKT. Need Sepolia ETH for gas? <span className={styles.clickableLink} onClick={handleSepoliaFaucet}>Click here</span> for free test ETH.
          </>
        );
      }
    } catch (error) {
      let displayError = "Transaction failed or was rejected.";
      let nextStatus = Status.ERROR;

      if (error.reason) {
        displayError = `Transaction Failed: ${error.reason}`;
      } else if (error.message && error.message.includes("FAUCET_LIMIT_REACHED")) {
        displayError = `Claim failed: You are over the ${FAUCET_LIMIT_DISPLAY.toLocaleString()} ZKT limit.`;
        nextStatus = Status.BALANCE_SUFFICIENT;
      } else if (error.code === 4001) {
        displayError = "Transaction rejected by user in wallet.";
        nextStatus = Status.CAN_CLAIM;
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        displayError = `Transaction failed: Pre-check failure. You may be over the ${FAUCET_LIMIT_DISPLAY.toLocaleString()} ZKT limit.`;
        nextStatus = Status.ERROR;
      }

      setStatus(nextStatus);
      setMessage(displayError);
    }
  }, [signer, status, account, onClaimComplete, handleSepoliaFaucet]);

  const isReadyToClaim = status === Status.CAN_CLAIM;
  const isSufficient = status === Status.BALANCE_SUFFICIENT;
  const isDisconnected = status === Status.DISCONNECTED;
  const isWaiting = status === Status.CHECKING_BALANCE || status === Status.CLAIMING;
  const isError = status === Status.ERROR;

  const handleRetry = useCallback(() => {
    if (account) {
      (async () => {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const currentSigner = provider.getSigner();
          setSigner(currentSigner);

          const contract = new ethers.Contract(ZKT_TOKEN_FAUCET_ADDRESS, ZKT_FAUCET_ABI, provider);
          const rawBalance = await contract.balanceOf(account);
          const currentBalance = parseFloat(ethers.utils.formatUnits(rawBalance, ZKT_DECIMALS));
          setBalance(currentBalance);

          if (currentBalance < REDIRECT_THRESHOLD_DISPLAY) {
            setStatus(Status.CAN_CLAIM);
            setMessage(
              <>
                Need Sepolia ETH for gas fees? <span className={styles.clickableLink} onClick={handleSepoliaFaucet}>Click here</span> for free test ETH, then claim ZKT.
              </>
            );
          } else {
            setStatus(Status.BALANCE_SUFFICIENT);
            setMessage(`Balance is sufficient (${currentBalance.toFixed(4)} ZKT). Ready to proceed.`);
          }
        } catch (error) {
          setStatus(Status.ERROR);
          setMessage("Error reading balance. Please check wallet.");
        }
      })();
    }
  }, [account, handleSepoliaFaucet]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>ZKT Test Faucet</h1>
        <p className={styles.subtitle}>
          Claim {CLAIM_AMOUNT_DISPLAY} ZKT for testing (limit: {FAUCET_LIMIT_DISPLAY.toLocaleString()} ZKT).
        </p>

        <div className={`${styles.statusBox} ${statusClassMap[status]}`}>
          <div className={styles.statusContent}>
            <span className={styles.statusIconWrapper}>
              {iconMap[status]}
            </span>
            <p className={styles.statusMessage}>{message}</p>
          </div>
        </div>

        <div className={styles.infoBox}>
          <p>
            <strong>Active Address:</strong>{" "}
            <span className={styles.addressText} title={account}>
              {displayAddress(account)}
            </span>
          </p>
          <p>
            <strong>Current Balance:</strong>{" "}
            <span className={styles.balanceText}>
              {balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} ZKT
            </span>
          </p>
        </div>

        {isDisconnected && (
          <button
            onClick={connectWallet}
            className={styles.connectButton}
          >
            CONNECT WALLET
          </button>
        )}

        {isReadyToClaim && (
          <button
            onClick={claimFaucet}
            disabled={isWaiting}
            className={styles.claimButton}
          >
            CLAIM {CLAIM_AMOUNT_DISPLAY} ZKT
          </button>
        )}

        {isSufficient && (
          <button
            onClick={onClaimComplete}
            className={styles.proceedButton}
          >
            Go to Main App ({balance.toFixed(4)} ZKT)
          </button>
        )}

        {isWaiting && (
          <button
            disabled={true}
            className={styles.waitingButton}
          >
            <LoaderIcon className={styles.loaderIconSmall} />
            {status === Status.CHECKING_BALANCE ? "Checking Balance..." : "Claiming Tokens..."}
          </button>
        )}

        {isError && (
          <button
            onClick={handleRetry}
            className={styles.retryButton}
          >
            Retry Connection
          </button>
        )}
        
        {(account && !isDisconnected) && disconnectWallet && (
            <div className={styles.disconnectSection}>
                <button
                    onClick={disconnectWallet}
                    className={styles.disconnectButton}
                >
                    Disconnect wallet
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default FaucetApp;
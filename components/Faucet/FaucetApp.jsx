import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
// Restoring your original imports:
import { ZKTAddress, ZKTABI } from "../../context/constant";


const ZKT_TOKEN_FAUCET_ADDRESS = ZKTAddress; 

const ZKT_DECIMALS = 18; 

// UI/Contract limits
const FAUCET_LIMIT_DISPLAY = 10000; 
const CLAIM_AMOUNT_DISPLAY = 1000; 
// NEW: Threshold for redirection (Balance >= 100 ZKT means redirect)
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

const LoaderIcon = ({ className = "w-6 h-6" }) => (
    <svg className={`${className} animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
const CheckCircleIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const XCircleIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const WalletIcon = ({ className = "w-6 h-6" }) => (
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

const statusClasses = {
    [Status.CHECKING_BALANCE]: 'bg-gray-700 text-gray-400 border-gray-600',
    [Status.CLAIMING]: 'bg-purple-900 text-purple-400 border-purple-500',
    [Status.CAN_CLAIM]: 'bg-blue-900 text-blue-400 border-blue-500',
    [Status.BALANCE_SUFFICIENT]: 'bg-green-900 text-green-400 border-green-500',
    [Status.DISCONNECTED]: 'bg-red-900 text-red-400 border-red-500',
    [Status.ERROR]: 'bg-red-900 text-red-400 border-red-500',
};

function displayAddress(address) {
    if (!address) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}


const FaucetApp = ({ account, onClaimComplete }) => {

    const [status, setStatus] = useState(Status.DISCONNECTED);
    const [message, setMessage] = useState('Connect your wallet to check your ZKT balance.');
    const [balance, setBalance] = useState(0);
    const [signer, setSigner] = useState(null);

    const setupSigner = useCallback(async () => {
        if (!window.ethereum) {
            setStatus(Status.ERROR);
            setMessage("Wallet provider not found. Please install MetaMask.");
            setSigner(null);
            return null;
        }
        
        try {
            const currentProvider = new ethers.providers.Web3Provider(window.ethereum);
            const currentSigner = currentProvider.getSigner(); 
            setSigner(currentSigner);
            return currentSigner;
        } catch (error) {
            console.error("Signer Setup Error:", error);
            setStatus(Status.DISCONNECTED);
            setMessage("Failed to get wallet signer. Ensure MetaMask is unlocked and connected.");
            setSigner(null);
            return null;
        }
    }, []);

    const connectWallet = useCallback(async () => {
        if (!window.ethereum) return;

        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
            console.error("Connection Request Error:", error);
            setStatus(Status.ERROR);
            setMessage("Connection request failed or was rejected by user.");
        }
    }, []);

    const checkBalance = useCallback(async (currentSigner) => {
        if (!currentSigner || !account) return;

        setStatus(Status.CHECKING_BALANCE);
        setMessage("Checking ZKT balance...");

        try {
            const contract = new ethers.Contract(
                ZKT_TOKEN_FAUCET_ADDRESS, 
                ZKT_FAUCET_ABI, 
                currentSigner.provider
            );

            const rawBalance = await contract.balanceOf(account);
            
            const currentBalance = parseFloat(ethers.utils.formatUnits(rawBalance, ZKT_DECIMALS)); 
            setBalance(currentBalance);

            // Logic updated: Check if balance is below the new 100 threshold
            if (currentBalance < REDIRECT_THRESHOLD_DISPLAY) {
                setStatus(Status.CAN_CLAIM);
                setMessage(`You currently have ${currentBalance.toFixed(4)} ZKT. Click to claim ${CLAIM_AMOUNT_DISPLAY} ZKT.`);
            } else {
                setStatus(Status.BALANCE_SUFFICIENT);
                setMessage(`Balance is sufficient (${currentBalance.toFixed(4)} ZKT). Ready to proceed.`);
            }
        } catch (error) {
            console.error("Balance Check Error:", error);
            setStatus(Status.ERROR);
            setMessage("Failed to read balance from contract. Check console for details.");
        }
    }, [account]);

    const claimFaucet = useCallback(async () => {
        if (!signer || status !== Status.CAN_CLAIM || !account) return;

        setStatus(Status.CLAIMING);
        setMessage("Initiating claim... Please confirm the transaction in your wallet.");

        try {
            const contract = new ethers.Contract(
                ZKT_TOKEN_FAUCET_ADDRESS, 
                ZKT_FAUCET_ABI, 
                signer
            );

            const tx = await contract.faucet();
            setMessage("Transaction sent! Waiting for confirmation...");
            
            // Wait for the transaction to be mined
            await tx.wait(); 
            setMessage("Claim successful! Checking final balance...");

            // 1. Explicitly fetch the new balance right after waiting for the transaction
            const provider = signer.provider;
            const readContract = new ethers.Contract(ZKT_TOKEN_FAUCET_ADDRESS, ZKT_FAUCET_ABI, provider);
            const rawBalance = await readContract.balanceOf(account);
            const newBalance = parseFloat(ethers.utils.formatUnits(rawBalance, ZKT_DECIMALS));
            
            // 2. Update the balance state immediately
            setBalance(newBalance); 

            // 3. Check threshold (100 ZKT) and set the final status
            if (newBalance >= REDIRECT_THRESHOLD_DISPLAY) { 
                setStatus(Status.BALANCE_SUFFICIENT); 
                setMessage(`Claim successful! Balance is now ${newBalance.toFixed(4)} ZKT. Proceeding to main app...`);
                
                // 4. Schedule the redirect
                setTimeout(() => {
                    if (onClaimComplete) {
                        onClaimComplete();
                    }
                }, 1500); 

            } else {
                // Should only happen if the claim amount was less than 100, which it isn't (it's 1000)
                setStatus(Status.CAN_CLAIM);
                setMessage(`Claim successful! You now have ${newBalance.toFixed(4)} ZKT. Claim again.`);
            }

        } catch (error) {
            console.error("Claim Faucet Error:", error);
            
            let displayError = "Transaction failed or was rejected.";
            let nextStatus = Status.ERROR;

            if (error.reason) {
                displayError = `Transaction Failed: ${error.reason}`;
            } else if (error.message && error.message.includes("FAUCET_LIMIT_REACHED")) {
                // Contract indicates limit reached
                displayError = `Claim failed: You are over the ${FAUCET_LIMIT_DISPLAY.toLocaleString()} ZKT limit.`;
                nextStatus = Status.BALANCE_SUFFICIENT;
            } else if (error.code === 4001) {
                displayError = "Transaction rejected by user in wallet.";
                nextStatus = Status.CAN_CLAIM; // Reset state
            } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
                 // Often indicates contract revert (like hitting the 10000 ZKT limit)
                 displayError = `Transaction failed: Pre-check failure. You may be over the ${FAUCET_LIMIT_DISPLAY.toLocaleString()} ZKT limit.`;
                 // Force a balance check to update the UI correctly
                 checkBalance(signer);
                 nextStatus = Status.ERROR; // Temporarily stay on error or let checkBalance handle state
            }
            
            setStatus(nextStatus);
            setMessage(displayError);
        }
    }, [signer, status, account, onClaimComplete, checkBalance]);

    useEffect(() => {
        if (!account) {
            setStatus(Status.DISCONNECTED);
            setMessage("Connect your wallet to check your ZKT balance.");
            return;
        }

        setupSigner().then(s => {
            if (s) {
                checkBalance(s);
            }
        });
        
    }, [account, setupSigner, checkBalance]);


    const isReadyToClaim = status === Status.CAN_CLAIM;
    const isSufficient = status === Status.BALANCE_SUFFICIENT;
    const isDisconnected = status === Status.DISCONNECTED;
    const isWaiting = status === Status.CHECKING_BALANCE || status === Status.CLAIMING;
    const isError = status === Status.ERROR;
    
    // Function for the Retry button
    const handleRetry = useCallback(() => {
        setupSigner().then(s => {
            if (s) {
                checkBalance(s);
            }
        });
    }, [setupSigner, checkBalance]);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-inter">
            <style jsx="true">{`
                .button-glow {
                    box-shadow: 0 0 5px #facc15, 0 0 15px #facc15, 0 0 25px rgba(250, 204, 21, 0.5);
                }
                .proceed-glow {
                    box-shadow: 0 0 5px #a855f7, 0 0 15px #a855f7, 0 0 25px rgba(168, 85, 247, 0.5);
                }
            `}</style>
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md text-white border border-gray-700">
                <h1 className="text-3xl font-bold text-center mb-2 text-yellow-400">
                    ZKT Test Faucet
                </h1>
                <p className="text-center text-gray-400 mb-8">
                    Claim {CLAIM_AMOUNT_DISPLAY} ZKT for testing (limit: {FAUCET_LIMIT_DISPLAY.toLocaleString()} ZKT).
                </p>

                <div className={`p-4 rounded-lg mb-6 shadow-inner transition duration-300 border-2 ${statusClasses[status]}`}>
                    <div className="flex items-center space-x-3">
                        <span className="flex-shrink-0">{iconMap[status]}</span>
                        <p className="text-lg font-medium">{message}</p>
                    </div>
                </div>

                <div className="text-sm text-gray-300 space-y-3 p-4 bg-gray-700 rounded-lg">
                    <p>
                        <strong>Active Address:</strong> 
                        <span className="font-mono text-xs text-purple-300 ml-2" title={account}>
                            {displayAddress(account)}
                        </span>
                    </p>
                    <p>
                        <strong>Current Balance:</strong> 
                        <span className="font-mono text-base text-yellow-300 ml-2">
                            {balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} ZKT
                        </span>
                    </p>
                </div>
                

                {isDisconnected && (
                    <button
                        onClick={connectWallet}
                        className="w-full mt-8 text-white font-bold py-3 px-4 rounded-lg transition duration-300 proceed-glow bg-green-600 hover:bg-green-700"
                    >
                        CONNECT WALLET
                    </button>
                )}
                
                {isReadyToClaim && (
                    <button
                        onClick={claimFaucet}
                        disabled={isWaiting}
                        className="w-full mt-8 text-gray-900 font-bold py-3 px-4 rounded-lg transition duration-300 button-glow bg-yellow-400 hover:bg-yellow-500"
                    >
                        CLAIM {CLAIM_AMOUNT_DISPLAY} ZKT
                    </button>
                )}

                {isSufficient && (
                    <button
                        onClick={onClaimComplete}
                        className="w-full mt-8 text-white font-bold py-3 px-4 rounded-lg transition duration-300 proceed-glow bg-indigo-600 hover:bg-indigo-700"
                    >
                        Go to Main App ({balance.toFixed(4)} ZKT)
                    </button>
                )}

                {isWaiting && (
                    <button
                        disabled={true}
                        className="w-full mt-8 text-white font-bold py-3 px-4 rounded-lg transition duration-300 bg-gray-600 cursor-not-allowed opacity-75"
                    >
                        <LoaderIcon className="w-5 h-5 inline mr-2" />
                        {status === Status.CHECKING_BALANCE ? "Checking Balance..." : "Claiming Tokens..."}
                    </button>
                )}
                
                {isError && (
                    <button
                        onClick={handleRetry}
                        className="w-full mt-8 text-white font-bold py-3 px-4 rounded-lg transition duration-300 proceed-glow bg-red-600 hover:bg-red-700"
                    >
                        Retry Connection/Check
                    </button>
                )}

            </div>
        </div>
    );
};

export default FaucetApp;
import { initFhevm, createInstance } from 'fhevmjs';
import { CONTRACTS, FHE_CONFIG, UI_CONSTANTS } from "./FHEConstants"

export const FHE_CONSTANTS = {
  SEPOLIA_FHEVM: 11155111,
  ZAMA_PREFIX: "zama_",
  ADDR_MASK_START: 6,
  ADDR_MASK_END: 4,
  DECRYPTION_TIMEOUT: 1200,
};

let fheInstance = null;
export async function initFHE() {
  await initFhevm();
  fheInstance = await createInstance({
    network: window.ethereum,
    gatewayUrl: 'https://gateway.cypherscan.ai',
  });
  return fheInstance;
}

export async function encryptAmount(amount) {
  if (!fheInstance) await initFHE();
  return await fheInstance.encrypt_u64(amount);
}

export function obfuscateAddress(address) {
  if (!address) return "zama_****";
  const prefix = address.slice(2, 2 + FHE_CONSTANTS.ADDR_MASK_START);
  const suffix = address.slice(-FHE_CONSTANTS.ADDR_MASK_END);
  return `${FHE_CONSTANTS.ZAMA_PREFIX}${prefix}****${suffix}`;
}

export async function getEncryptedBalance(account) {
  const loadingState = { isLoading: true, value: "Decrypting..." };
  
  setTimeout(() => {
    const balance = 1234.56; 
    return { 
      isLoading: false, 
      value: `${balance.toFixed(2)} zKrypt`,
      encrypted: obfuscateAddress(account)
    };
  }, FHE_CONSTANTS.DECRYPTION_TIMEOUT);
  
  return loadingState;
}

export async function encryptTransfer(to, amount) {
  const encryptedAmount = await encryptAmount(amount);
  return {
    to: obfuscateAddress(to),
    amount: encryptedAmount,
    proof: "0x_fake_proof_" + Date.now()
  };
}

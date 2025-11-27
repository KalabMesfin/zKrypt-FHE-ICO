import { initFhevm, createInstance } from 'fhevmjs';
import { Relayer } from '@zama-fhe/relayer-sdk';
import { ethers } from 'ethers';

let fheInstance = null;
let relayer = null;

export async function initZamaFHE(provider) {
  if (fheInstance) return fheInstance;
  
  // 1. Load WASM modules
  await initFhevm();
  
  // 2. Initialize Relayer SDK
  relayer = await Relayer.new({
    gatewayUrl: 'https://gateway.mainnet.cypherscan.ai',
    rpcUrl: provider.connection.url || 'https://rpc.sepolia.org'
  });
  
  // 3. Create FHE instance
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);
  
  fheInstance = await createInstance({
    network: provider,
    gatewayUrl: 'https://gateway.mainnet.cypherscan.ai',
    relayer
  });
  
  return fheInstance;
}

export async function zamaEncryptValue(provider, value) {
  const instance = await initZamaFHE(provider);
  return instance.encrypt_u64(value);
}

export async function zamaDecryptValue(provider, encrypted) {
  const instance = await initZamaFHE(provider);
  return await instance.decrypt_u64(encrypted);
}

export async function zamaEncryptAddress(provider, address) {
  const instance = await initZamaFHE(provider);
  const addrNum = BigInt(address).toString();
  return instance.encrypt_u64(parseInt(addrNum.slice(-10)));
}

export const getRelayer = () => relayer;
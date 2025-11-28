export const prepareEncryptedTransfer = async (instance, toAddress, amount) => {
    const encAmount = instance.TFHE.asEuint32(amount);
    instance.TFHE.allow(encAmount, CONTRACT_ADDRESS);
    return encAmount;
};

export const decryptBalance = async (instance, encryptedBalance) => {
    return await instance.TFHE.decrypt(encryptedBalance);
};

export const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatZamaAddress = (address) => {
    return `zama_${truncateAddress(address)}`;
};

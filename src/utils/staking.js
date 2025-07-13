import { ethers } from 'ethers';
import STAKING_ABI from '../abis/stakingAbi.json';

const STAKING_ADDRESS = "0xd949c3bad89cff9fd8b08a007e3e0e763a673c75";

export function getMoguStakingContract(providerOrSigner) {
    return new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, providerOrSigner);
}

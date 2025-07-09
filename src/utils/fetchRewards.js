import { ethers } from 'ethers';
import boxAbi from '../abis/MoguBox.json';

const MOGUBOX_ADDRESS = '0xd34171cf0e1142b1aae996c35197f0dba7014997'; // your box contract

export async function fetchLast10Rewards() {
    const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL); // or Ankr/Alchemy endpoint

    const boxContract = new ethers.Contract(MOGUBOX_ADDRESS, boxAbi, provider);

    const filter = boxContract.filters.BoxOpened();
    const logs = await boxContract.queryFilter(filter, -5000); // last ~5000 blocks

    const last10 = logs.slice(-10).reverse().map((log) => {
        const { args } = log;
        return {
            user: args.user,
            rewardId: args.rewardId.toString(),
            rewardType: args.rewardType,
            txHash: log.transactionHash,
        };
    });

    return last10;
}

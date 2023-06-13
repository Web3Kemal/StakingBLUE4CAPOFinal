import {
  ConnectWallet,
  useAddress,
  useContract,
  useContractRead,
  useContractWrite,
  useTokenBalance,
  Web3Button,
} from "@thirdweb-dev/react";

import { ethers } from "ethers";

import { useEffect, useState, useMemo } from "react";
import styles from "../styles/Home.module.css";
import { stakingContractAddress } from "../const/yourDetails.js";

export default function Home() {
  const address = useAddress();
  const [amountToStake, setAmountToStake] = useState(0);

  // Initialize all the contracts
  const { contract: staking, isLoading: isStakingLoading } = useContract(
    stakingContractAddress,
    "custom"
  );

  // Get contract data from staking contract
  const { data: rewardTokenAddress } = useContractRead(staking, "rewardToken");
  const { data: stakingTokenAddress } = useContractRead(
    staking,
    "stakingToken"
  );

  // Initialize token contracts
  const { contract: stakingToken, isLoading: isStakingTokenLoading } =
    useContract(stakingTokenAddress, "token");
  const { contract: rewardToken, isLoading: isRewardTokenLoading } =
    useContract(rewardTokenAddress, "token");

  // Token balances
  const { data: stakingTokenBalance, refetch: refetchStakingTokenBalance } =
    useTokenBalance(stakingToken, address);
  const { data: rewardTokenBalance, refetch: refetchRewardTokenBalance } =
    useTokenBalance(rewardToken, address);

  

        
  // Get staking data
  const {
    data: stakeInfo,
    refetch: refetchStakingInfo,
    isLoading: isStakeInfoLoading,
    error
  } = useContractRead(staking, "getStakeInfo", address);



  useEffect(() => {
    setInterval(() => {
      refetchData();
    }, 10000);
  });

  const refetchData = () => {
    refetchRewardTokenBalance();
    refetchStakingTokenBalance();
    refetchStakingInfo();
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Stake BLUE for free CAPO!</h1>
        <p className={styles.description}>
          Earn $CAPO for free, simply stake your $BLUE tokens!
        </p>

        <div className={styles.connect}>
          <ConnectWallet />
        </div>

        <div className={styles.stakeContainer}>
          <input
            className={styles.textbox}
            type="number"
            value={amountToStake}
            onChange={(e) => setAmountToStake(e.target.value)}
          />

          <Web3Button
            className={styles.button}
            contractAddress={stakingContractAddress}
            action={async (contract) => {

              const currentAllowanceObject = await stakingToken.allowance(stakingContractAddress);

              const currentAllowanceBlue = ethers.utils.formatUnits(currentAllowanceObject.value, "ether");
              
             /*  console.log(Number(amountToStake) );
              console.log( Number(currentAllowanceBlue));
              if ( Number(currentAllowanceBlue) < Number(amountToStake) ) { */
                await stakingToken.setAllowance(
                  stakingContractAddress,
                  amountToStake
                );
             // }

              const res = await contract.contractWrapper.writeContract.stake(ethers.utils.parseEther(amountToStake));
               console.log(res);
            
            }}
          >
            Stake!
          </Web3Button>

          <Web3Button
            className={styles.button}
            contractAddress={stakingContractAddress}
            action={async (contract) => {
              await contract.call(
                "withdraw",
                ethers.utils.parseEther(amountToStake)
              );
              alert("Tokens unstaked successfully!");
            }}
          >
            Unstake!
          </Web3Button>

          <Web3Button
            className={styles.button}
            contractAddress={stakingContractAddress}
            action={async (contract) => {
              await contract.call("claimRewards");
              alert("Rewards claimed successfully!");
            }}
          >
            Claim rewards!
          </Web3Button>
        </div>

        <div className={styles.grid}>
          <a className={styles.card}>
            <h2>Stake token balance</h2>
            <p>{stakingTokenBalance?.displayValue}</p>
          </a>

          <a className={styles.card}>
            <h2>Reward token balance</h2>
            <p>{rewardTokenBalance?.displayValue}</p>
          </a>

          <a className={styles.card}>
            <h2>Staked amount</h2>
            <p>
              {stakeInfo && ethers.utils.formatEther(stakeInfo[0].toString())}
            </p>
          </a>

          <a className={styles.card}>
            <h2>Current reward</h2>
            <p>
              {stakeInfo && ethers.utils.formatEther(stakeInfo[1].toString())}
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}

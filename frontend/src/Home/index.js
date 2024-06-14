/* global BigInt */
//import main modules
import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import { Input, Tooltip } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import { FiInfo } from "react-icons/fi";
import { FcInfo } from "react-icons/fc";

import { Tabs, Tab, TabPanel } from "../components/tabs/tabs";
import { useGlobalContext } from "../providers/GlobalProvider";
import * as Constants from "../constants";
import config from "../config";

import { getStakeStateData, getUserStateData, initializeStaking, withdraw, initialize, withdrawToken, stakeToken, claimToken, deposit } from "../contracts/locker/presale.ts";

import { IntervalComponent, getTokenAccountBalance, numberWithCommas, send, sendTransaction, showTxResult } from "../utils/util";
import { DECIMALS, STAKE_TOKEN_MINT, TREASURY } from "../contracts/locker/constants.ts";
import { PublicKey } from "@solana/web3.js";


export default function Home() {
    const wallet = useWallet();
    const { darkMode } = useGlobalContext();

    function useQuery() {
        return new URLSearchParams(useLocation().search);
    }

    const query = useQuery();

    const featureData = [
        {
            title: '1 Month',
            period: 30,
            apy: 25,
            minAmount: 1000
        },
        {
            title: '3 Month',
            period: 90,
            apy: 50,
            minAmount: 10000
        },
        {
            title: '6 Month',
            period: 180,
            apy: 75,
            minAmount: 100000
        },
        {
            title: '1 Year',
            period: 365,
            apy: 100,
            minAmount: 500000
        },
        {
            title: '4 Year',
            period: 1460,
            apy: 125,
            minAmount: 1000000
        }
    ]

    const [activeTab, setActiveTab] = useState(0);
    const [activeTab2, setActiveTab2] = useState(0);
    const [stakeAmount, setStakeAmount] = useState(0);
    const [userStakeData, setUserStakeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAdmin, setAdmin] = useState(false);

    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState(0);
    
    const [totalLocked, setTotalLocked] = useState(0);
    const [vaultBalance, setVaultBalance] = useState(0);

    useEffect(() => {
        const getData = async () => {
            const stakeData = await getStakeStateData();
            console.log('stakeData = ', stakeData);
            if (stakeData && stakeData?.length > 0) {
                let _totalLocked = 0;
                stakeData.map((item, index) => {
                    console.log(item.account.cardNo, ': ', item.account.totalStaked.toString())
                    _totalLocked += parseInt(item.account.totalStaked.toString());
                });

                setTotalLocked((_totalLocked / Math.pow(10, 9)).toFixed(0));
            }

            const vaultAddress = 'FRrG7p3Fb6MrJfENQ24eZ3FX7UWTMasdmzuGjGZMJXEy';
            const { uiAmount } = await getTokenAccountBalance(new PublicKey(STAKE_TOKEN_MINT), new PublicKey(vaultAddress), true);
            setVaultBalance(Number(uiAmount).toFixed(0));
        }

        getData();
    }, [])

    useEffect(() => {
        const getUserData = async () => {
            if (!wallet?.publicKey) {
                setUserStakeData(null);
                setBalance(0);
                setAdmin(false);
                return;
            }
            const userStakeData = await getUserStateData(wallet, activeTab);
            console.log('userStakeData = ', userStakeData);
            // if (userStakeData.length > 0) {
            //     userStakeData.map((item, index) => {
            //         console.log( item.account.cardNo, ': ', item.account.stakeAmount.toString(), item.publicKey.toBase58())

            //     })
            // }

            setUserStakeData(userStakeData);


            const { uiAmount } = await getTokenAccountBalance(new PublicKey(STAKE_TOKEN_MINT), wallet.publicKey);
            setBalance(Number(uiAmount).toFixed(2));

            if (wallet.publicKey.toBase58() == TREASURY) {
                setAdmin(false);
            }
        }

        getUserData();
    }, [wallet, activeTab]);

    const getRef = () => {
        const ref = query.get("ref");
        return ref;
    };

    const handleChangeTab = (value) => {
        setActiveTab(value);
    }

    const handleChangeTab2 = (e, value) => {
        setActiveTab2(value);
    }

    const link = `${window.origin}?ref=${wallet?.publicKey?.toBase58()}`;

    const handleClickCopy = () => {
        if (wallet) {
            navigator.clipboard.writeText(link);
            toast.success('Successfully copied!');
        } else {
            toast.warning('Please connect your wallet.');
        }
    }

    const handleClickInitializePool = async () => {
        if (!wallet?.publicKey) {
            toast.info('Please connect your wallet');
            return;
        }

        if (loading) {
            toast.info('Processing now...');
            return;
        }

        try {
            setLoading(true);

            const txhash = await initializeStaking(wallet, activeTab);

            showTxResult(txhash);
        } catch (err) {
            console.error('initializeStaking error: ', err);
        }

        setLoading(false);
    }

    const handleClickInitialize = async () => {
        if (!wallet?.publicKey) {
            toast.info('Please connect your wallet');
            return;
        }

        if (loading) {
            toast.info('Processing now...');
            return;
        }

        try {
            setLoading(true);

            const txhash = await initialize(wallet);
            showTxResult(txhash);

            console.log('txhash: ', txhash);
        } catch (err) {
            console.error('initializeStaking error: ', err);
        }

        setLoading(false);
    }

    const handleClickStakeToken = async () => {
        if (!wallet?.publicKey) {
            toast.info('Please connect your wallet');
            return;
        }

        if (loading) {
            toast.info('Processing now...');
            return;
        }

        if (stakeAmount < featureData[activeTab].minAmount) {
            toast.info(`Minimim stake amount: ${numberWithCommas(featureData[activeTab].minAmount)}`);
            return;
        }

        if (stakeAmount > balance) {
            toast.info('Insufficient token balance');
            return;
        }

        try {
            setLoading(true);
            const ref = getRef();
            console.log("ref: ", ref);
            const txhash = await stakeToken(wallet, stakeAmount, activeTab, ref);
            showTxResult(txhash);
            console.log('txhash: ', txhash);
        } catch (err) {
            console.error('handleClickStake error: ', err);
        }

        setLoading(false);
    }

    const handleClickWithdrawToken = async () => {
        if (!wallet?.publicKey) {
            toast.info('Please connect your wallet');
            return;
        }

        if (loading) {
            toast.info('Processing now...');
            return;
        }

        if (userStakeData == null || userStakeData?.stakeAmount == 0) {
            toast.info('No withdrawable amount');
            return;
        }

        if (!canWithdraw()) {
            toast.error('Not withdrawable yet');
            return;
        }

        try {
            setLoading(true);

            const txhash = await withdrawToken(wallet, activeTab);
            showTxResult(txhash);
            console.log('txhash: ', txhash);
        } catch (err) {
            console.error('handleClickStake error: ', err);
        }

        setLoading(false);
    }

    const handleClickClaimToken = async () => {
        if (!wallet?.publicKey) {
            toast.info('Please connect your wallet');
            return;
        }

        if (loading) {
            toast.info('Processing now...');
            return;
        }

        if (userStakeData == null || userStakeData?.stakeAmount == 0) {
            toast.info('No claimable amount');
            return;
        }

        if (!canClaim()) {
            toast.error('Not claimable yet');
            return;
        }

        try {
            setLoading(true);

            const txhash = await claimToken(wallet, activeTab);
            showTxResult(txhash);
            console.log('txhash: ', txhash);
        } catch (err) {
            console.error('handleClickStake error: ', err);
        }

        setLoading(false);
    }
    const handleClickDeposit = async () => {
        if (!wallet?.publicKey) {
            toast.info('Please connect your wallet');
            return;
        }

        if (loading) {
            toast.info('Processing now...');
            return;
        }

        try {
            setLoading(true);

            const txhash = await deposit(wallet, amount);
            showTxResult(txhash);
            console.log('txhash: ', txhash);
        } catch (err) {
            console.error('handleClickDeposit error: ', err);
        }

        setLoading(false);
    }

    const handleClickWithdraw = async () => {
        if (!wallet?.publicKey) {
            toast.info('Please connect your wallet');
            return;
        }

        if (loading) {
            toast.info('Processing now...');
            return;
        }

        // if (userStakeData == null || userStakeData?.stakeAmount == 0) {
        //     toast.info('No withdrawable amount');
        //     return;
        // }

        // if (!canWithdraw()) {
        //     toast.error('Not withdrawable yet');
        //     return;
        // }

        try {
            setLoading(true);

            const txhash = await withdraw(wallet, amount);
            showTxResult(txhash);
            console.log('txhash: ', txhash);
        } catch (err) {
            console.error('handleClickWithdraw error: ', err);
        }

        setLoading(false);
    }

    const canWithdraw = () => {
        const _curTiem = Date.now() / 1000;
        const stakeTime = userStakeData?.stakeTime || 0;

        return featureData[activeTab].period * 86400 + stakeTime < _curTiem ? true : false;
    }
    
    const canClaim = () => {
        const _curTiem = Date.now() / 1000;
        const lastClaimTime = Math.max(userStakeData?.stakeTime, userStakeData?.claimTime) || 0;

        return 7 * 86400 + lastClaimTime < _curTiem ? true : false;
    }

    const pendingRewards = () => {
        const _curTiem = Date.now() / 1000;
        const stakeTime = userStakeData?.stakeTime || 0;
        const stakeAmount = userStakeData?.stakeAmount || 0;

        const result = stakeAmount / Math.pow(10, DECIMALS) * (_curTiem - stakeTime) / 86400 * featureData[activeTab].apy / 100 / 365;
        return (
            <>{result.toFixed(2)}</>
        )
    }

    return (
        <div className="flex flex-col gap-8 items-center justify-center p-8 xs:p-4">
            <div className="flex flex-row justify-center items-center w-full max-w-[640px] relative h-32 xs:h-16">
                <p className="text-white text-3xl xs:text-2xl font-bold text-center">STAKING</p>
            </div>
            <div className='create-panel text-white bg-[linear-gradient(127deg,_rgba(6,_11,_40,_0.74)_28.26%,rgba(10,_14,_35,_0.71)_91.2%)]'>
                <div className="flex flex-row justify-between xs:justify-center w-full p-2 flex-wrap rounded bg-[#03132c]" selectedTab={activeTab} onChange={handleChangeTab}>
                    {
                        featureData.map((item, index) => {
                            return (
                                <div className={`w-24 p-2 rounded cursor-pointer ${activeTab == index ? 'bg-[#4628ff]' : 'bg-transparent'}`} key={index} onClick={() => handleChangeTab(index)}>{item.title}</div>
                            );
                        })
                    }
                </div>
                <div className="w-full flex flex-row gap-8 justify-between border rounded-xl px-8 py-4">
                    <p className="text-xl font-bold">Total Locked</p>
                    <p className="text-xl font-bold">{ numberWithCommas(vaultBalance) }</p>
                </div>
                {/* <div className="w-full flex flex-row gap-8 justify-between border rounded-xl px-8 py-4">
                    <p className="text-xl font-bold">Treasury Vault</p>
                    <p className="text-xl font-bold">{ numberWithCommas(vaultBalance) }</p>
                </div> */}

                {
                    featureData.map((item, index) => {
                        return (
                            <TabPanel value={activeTab} selectedIndex={index}>
                                <p className="text-3xl xs:text-2xl font-bold py-4 xs:pb-8 uppercase">Staking for {item.period} days</p>
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between">
                                        <p>Total Staked</p>
                                        <p>{userStakeData?.stakeAmount.toString() / Math.pow(10, DECIMALS) || 0}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p>Can Withdraw</p>
                                        <IntervalComponent
                                            createdAt=
                                            {
                                                (userStakeData?.stakeTime || 0) === 0 ? 0 : (featureData[activeTab].period * 86400 + Number(userStakeData?.stakeTime || 0))
                                            }
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <p>Total Claimed</p>
                                        <p>{userStakeData?.claimAmount.toString() / Math.pow(10, DECIMALS) || 0}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p>Pending Reward</p>
                                        <p>{pendingRewards()}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p>APY</p>
                                        <p>{item.apy}%</p>
                                    </div>
                                </div>
                            </TabPanel>
                        );
                    })
                }

                <div className="rounded-lg p-4 flex flex-col gap-4 w-full py-8">
                    <p className="text-2xl font-bold uppercase">Referral Link</p>
                    <Input
                        value={wallet ? link : ""}
                        readOnly
                        className="!cursor-pointer text-xl !font-bold !text-white border rounded-lg p-2"
                        onClick={handleClickCopy}
                    />
                    <p>
                        Earn 1% of the tokens staked from anyone who uses your referral link
                    </p>
                </div>

                <Tabs selectedTab={activeTab2} onChange={handleChangeTab2}>
                    <Tab label='STAKE' value={0} />
                    <Tab label='WITHDRAW' value={1} />
                    <Tab label='CLAIM' value={2} />
                </Tabs>

                <TabPanel value={activeTab2} selectedIndex={0}>
                    <div className="relative w-full text-left flex flex-col gap-4">
                        <span className='title-2 text-white dark:text-black'>Enter stake amount</span>
                        <p className="absolute text-lg right-1">{`Balance: ${balance}`}</p>
                        <input
                            className='text-input bg-[#00000080] dark:bg-regal-white text-white dark:text-black'
                            type="number"
                            placeholder=''
                            value={stakeAmount}
                            onChange={e => setStakeAmount(e.target.value)}
                        />
                        <button
                            className="absolute w-14 right-3 top-11 xs:top-10 xs:text-sm bg-blue-600 px-2 py-1 rounded-md"
                            onClick={() => setStakeAmount(balance)}
                        >
                            Max
                        </button>
                        <button
                            className="absolute w-14 right-20 top-11 xs:top-10 xs:text-sm bg-blue-600 px-2 py-1 rounded-md"
                            onClick={() => setStakeAmount(balance / 2)}
                        >
                            Half
                        </button>
                        <div className='w-full'>
                            <button
                                role='button'
                                className='btn-create w-full'
                                onClick={handleClickStakeToken}
                            >
                                <p className="title-2 text-white">Stake</p>
                            </button>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel value={activeTab2} selectedIndex={1}>
                    <div className='w-full'>
                        <button
                            role='button'
                            className='btn-create w-full'
                            onClick={handleClickWithdrawToken}
                        >
                            <p className="title-2 text-white">Withdraw</p>
                        </button>
                    </div>
                </TabPanel>

                <TabPanel value={activeTab2} selectedIndex={2}>
                    <div className='w-full'>
                        <button
                            role='button'
                            className='btn-create w-full'
                            onClick={handleClickClaimToken}
                        >
                            <p className="title-2 text-white">Claim Reward</p>
                        </button>
                    </div>
                </TabPanel>
                {/* <div className="flex flex-row gap-8">
                    <button 
                        className="btn-create w-fit"
                        onClick={ handleClickInitializePool }
                    >
                        Initialize Pool
                    </button>
                    
                    <button 
                        className="btn-create w-fit"
                        onClick={ handleClickInitialize }
                    >
                        Initialize
                    </button>
                </div> */}


                <div className="flex flex-row gap-8 w-full">
                    <input
                        className='text-input bg-[#00000080] dark:bg-regal-white text-white dark:text-black'
                        type="number"
                        placeholder=''
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                    {/* <button 
                            className="btn-create w-full !bg-red-600"
                            onClick={ handleClickDeposit }
                        >
                            Deposit
                        </button> */}

                    <button
                        className="btn-create w-full !bg-red-600"
                        onClick={handleClickWithdraw}
                    >
                        Withdraw
                    </button>
                </div>
            </div>
        </div>
    );
}

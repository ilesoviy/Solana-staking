import * as anchor from "@project-serum/anchor";
import {
    Connection,
    Keypair,
    PublicKey,
    SYSVAR_RENT_PUBKEY,
    SystemProgram,
    Transaction,
    TransactionSignature,
    clusterApiUrl
} from "@solana/web3.js";

import {
    Account,
    getAccount,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction
} from "@solana/spl-token";

import { IDL } from "../idls/presale.ts";
import config from "../../config.js";
import * as Constants from "./constants.ts";
import * as keys from "./keys.ts";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { checkWalletAddressFormat } from "../../utils/util.js";

let networkUrl = clusterApiUrl(Constants.NETWORK);

console.log("networkUrl: ", networkUrl);
let connection = new Connection(networkUrl, "confirmed");

// const connection = new Connection(clusterApiUrl('devnet'));

const botKeyPair = Keypair.fromSecretKey(Uint8Array.from(config.pk));

export const getPresaleProgram = (wallet: any) => {
    let provider = new anchor.AnchorProvider(
        connection,
        wallet,
        anchor.AnchorProvider.defaultOptions()
    );
    const program = new anchor.Program(IDL, Constants.PRESALE_PROGRAM_ID, provider);
    return program;
};

export const initializeStaking = async (
    wallet: WalletContextState,
    cardNo: number
): Promise<string | null> => {
    if (wallet.publicKey === null) throw new WalletNotConnectedError();
    console.log('initializeStaking: ', cardNo);
    const program = getPresaleProgram(wallet);
    const stakeStateKey = await keys.getPresaleStateKey(cardNo);
    console.log('stakeStateKey: ', stakeStateKey.toBase58());

    const tx = new Transaction().add(
        await program.methods
            .initializeStake(
                cardNo
            )
            .accounts({
                user: wallet.publicKey,
                stakeState: stakeStateKey,
                tokenMint: Constants.STAKE_TOKEN_MINT,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY
            })
            .instruction()
    );
    return await send(connection, wallet, tx);
};

export const initialize = async (
    wallet: WalletContextState,
): Promise<string | null> => {
    if (wallet.publicKey === null) throw new WalletNotConnectedError();
    const program = getPresaleProgram(wallet);
    const globalStateKey = await keys.getGlobalStateKey();
    console.log('globalStateKey: ', globalStateKey.toBase58());

    const tx = new Transaction().add(
        await program.methods
            .initialize(
                wallet.publicKey
            )
            .accounts({
                authority: wallet.publicKey,
                globalState: globalStateKey,
                treasury: Constants.TREASURY,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY
            })
            .instruction()
    );
    return await send(connection, wallet, tx);
};

export const stakeToken = async (
    wallet: WalletContextState,
    stakeAmount: number,
    cardNo: number,
    ref: string
): Promise<string | null> => {
    console.log('stake: ', stakeAmount, cardNo);
    if (wallet.publicKey === null) throw new WalletNotConnectedError();

    const program = getPresaleProgram(wallet);

    const globalStateKey = await keys.getGlobalStateKey();
    console.log('globalStateKey: ', globalStateKey.toBase58());

    const stakeStateKey = await keys.getPresaleStateKey(cardNo);
    console.log('stakeStateKey: ', stakeStateKey.toBase58());

    const userStakeKey = await keys.getPresaleUserStateKey(wallet.publicKey, cardNo);
    console.log('userStakeKey: ', userStakeKey.toBase58());

    const tx = new Transaction();

    const tokenVault = await getAssociatedTokenAddress(Constants.STAKE_TOKEN_MINT, globalStateKey, true); // Already created by owner
    console.log('tokenVault: ', tokenVault.toBase58());
    const userVault = await getAssociatedTokenAddress(Constants.STAKE_TOKEN_MINT, wallet.publicKey);
    console.log('userVault: ', userVault.toBase58());
    const treasuryVault = await getAssociatedTokenAddress(Constants.STAKE_TOKEN_MINT, Constants.TREASURY);
    console.log('treasuryVault: ', treasuryVault.toBase58());

    // Create an instruction to create the receiver's token account if it does not exist
    const createAccountInstruction = createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        tokenVault,
        globalStateKey,
        Constants.STAKE_TOKEN_MINT,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    )

    // Check if the receiver's token account exists
    let receiverTokenAccount: Account;
    try {
        receiverTokenAccount = await getAccount(
            connection,
            tokenVault,
            "confirmed",
            TOKEN_PROGRAM_ID
        )
        console.log("receiverTokenAccount: ", receiverTokenAccount);
    } catch (e) {
        console.error("getATA Error: ", e);
        // If the account does not exist, add the create account instruction to the transaction
        tx.add(createAccountInstruction)
    }

    let refAccount: PublicKey;
    let refATA: PublicKey;
    if (checkWalletAddressFormat(ref)) {
        refAccount = new PublicKey(ref);
    } else {
        refAccount = Constants.TREASURY;
    }
    refATA = await getAssociatedTokenAddress(Constants.STAKE_TOKEN_MINT, refAccount);
    console.log("refATA: ", refATA.toBase58());
    // Create an instruction to create the receiver's token account if it does not exist
    const createAccountInstruction2 = createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        refATA,
        refAccount,
        Constants.STAKE_TOKEN_MINT,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    )

    // Check if the receiver's token account exists
    let receiverTokenAccount2: Account;
    try {
        receiverTokenAccount2 = await getAccount(
            connection,
            refATA,
            "confirmed",
            TOKEN_PROGRAM_ID
        )
        console.log("receiverTokenAccount2: ", receiverTokenAccount2);
    } catch (e) {
        // If the account does not exist, add the create account instruction to the transaction
        tx.add(createAccountInstruction2)
    }

    // tx.add(
    //     createTransferInstruction(
    //         userVault, 
    //         refATA, 
    //         wallet.publicKey, 
    //         stakeAmount * Constants.AFFILATE_FEE / 100 * Math.pow(10, Constants.DECIMALS),
    //         []
    //     )
    // );
    // stakeAmount = stakeAmount - (stakeAmount * Constants.AFFILATE_FEE / 100);


    console.log("Real stakeAmount: ", stakeAmount);

    tx.add(
        await program.methods
            .stakeToken(
                new anchor.BN(stakeAmount * Math.pow(10, Constants.DECIMALS)),
                cardNo
            )
            .accounts({
                user: wallet.publicKey,
                globalState: globalStateKey,
                stakeState: stakeStateKey,
                userState: userStakeKey,
                tokenMint: Constants.STAKE_TOKEN_MINT,
                tokenVault,
                userVault,
                treasuryVault,
                referrerVault: refATA,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
                systemProgram: SystemProgram.programId,
            })
            .instruction()
    );

    return await send(connection, wallet, tx);
};

export const withdrawToken = async (
    wallet: WalletContextState,
    cardNo: number
): Promise<string | null> => {
    console.log('withdraw: ', cardNo);
    if (wallet.publicKey === null) throw new WalletNotConnectedError();

    const program = getPresaleProgram(wallet);

    const globalStateKey = await keys.getGlobalStateKey();
    console.log('globalStateKey: ', globalStateKey.toBase58());

    const stakeStateKey = await keys.getPresaleStateKey(cardNo);
    console.log('stakeStateKey: ', stakeStateKey.toBase58());

    const userStakeKey = await keys.getPresaleUserStateKey(wallet.publicKey, cardNo);
    console.log('userStakeKey: ', userStakeKey.toBase58());

    const tx = new Transaction();

    const tokenVault = await getAssociatedTokenAddress(Constants.STAKE_TOKEN_MINT, globalStateKey, true); // Already created by owner
    console.log('tokenVault: ', tokenVault.toBase58());
    const userVault = await getAssociatedTokenAddress(Constants.STAKE_TOKEN_MINT, wallet.publicKey);
    console.log('userVault: ', userVault.toBase58());
    const treasuryVault = await getAssociatedTokenAddress(Constants.STAKE_TOKEN_MINT, Constants.TREASURY);
    console.log('treasuryVault: ', treasuryVault.toBase58());

    tx.add(
        await program.methods
            .withdrawToken(
                cardNo
            )
            .accounts({
                user: wallet.publicKey,
                globalState: globalStateKey,
                stakeState: stakeStateKey,
                userState: userStakeKey,
                tokenMint: Constants.STAKE_TOKEN_MINT,
                tokenVault,
                userVault,
                treasuryVault,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
                systemProgram: SystemProgram.programId,
            })
            .instruction()
    );

    return await send(connection, wallet, tx);
};

export const claimToken = async (
    wallet: WalletContextState,
    cardNo: number
): Promise<string | null> => {
    console.log('claim: ', cardNo);
    if (wallet.publicKey === null) throw new WalletNotConnectedError();

    const program = getPresaleProgram(wallet);

    const globalStateKey = await keys.getGlobalStateKey();
    console.log('globalStateKey: ', globalStateKey.toBase58());

    const stakeStateKey = await keys.getPresaleStateKey(cardNo);
    console.log('stakeStateKey: ', stakeStateKey.toBase58());

    const userStakeKey = await keys.getPresaleUserStateKey(wallet.publicKey, cardNo);
    console.log('userStakeKey: ', userStakeKey.toBase58());

    const tx = new Transaction();

    const tokenVault = await getAssociatedTokenAddress(Constants.STAKE_TOKEN_MINT, globalStateKey, true); // Already created by owner
    console.log('tokenVault: ', tokenVault.toBase58());
    const userVault = await getAssociatedTokenAddress(Constants.STAKE_TOKEN_MINT, wallet.publicKey);
    console.log('userVault: ', userVault.toBase58());
    const treasuryVault = await getAssociatedTokenAddress(Constants.STAKE_TOKEN_MINT, Constants.TREASURY);
    console.log('treasuryVault: ', treasuryVault.toBase58());

    tx.add(
        await program.methods
            .claimToken(
                cardNo
            )
            .accounts({
                user: wallet.publicKey,
                globalState: globalStateKey,
                stakeState: stakeStateKey,
                userState: userStakeKey,
                tokenMint: Constants.STAKE_TOKEN_MINT,
                tokenVault,
                userVault,
                treasuryVault,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
                systemProgram: SystemProgram.programId,
            })
            .instruction()
    );

    return await send(connection, wallet, tx);
};

///////////////////  Owner function   ///////////////////////
export const deposit = async (
    wallet: WalletContextState,
    amount: number,
): Promise<string | null> => {
    console.log('deposit: ', amount);
    if (wallet.publicKey === null) throw new WalletNotConnectedError();

    const program = getPresaleProgram(wallet);

    const globalStateKey = await keys.getGlobalStateKey();
    console.log('globalStateKey: ', globalStateKey.toBase58());

    
    const tx = new Transaction();

    const tokenVault = await getAssociatedTokenAddress(Constants.STAKE_TOKEN_MINT, globalStateKey, true); // Already created by owner
    console.log('tokenVault: ', tokenVault.toBase58());
    const userVault = await getAssociatedTokenAddress(Constants.STAKE_TOKEN_MINT, wallet.publicKey);
    console.log('userVault: ', userVault.toBase58());
    
    // Create an instruction to create the receiver's token account if it does not exist
    const createAccountInstruction = createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        tokenVault,
        globalStateKey,
        Constants.STAKE_TOKEN_MINT,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    )

    // Check if the receiver's token account exists
    let receiverTokenAccount: Account;
    try {
        receiverTokenAccount = await getAccount(
            connection,
            tokenVault,
            "confirmed",
            TOKEN_PROGRAM_ID
        )
        console.log("receiverTokenAccount: ", receiverTokenAccount);
    } catch (e) {
        console.error("getATA Error: ", e);
        // If the account does not exist, add the create account instruction to the transaction
        tx.add(createAccountInstruction)
    }

    tx.add(
        await program.methods
            .deposit(
                new anchor.BN(amount * Math.pow(10, Constants.DECIMALS)),
            )
            .accounts({
                user: wallet.publicKey,
                globalState: globalStateKey,
                tokenMint: Constants.STAKE_TOKEN_MINT,
                tokenVault,
                userVault,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
                systemProgram: SystemProgram.programId,
            })
            .instruction()
    );

    return await send(connection, wallet, tx);
};

export const withdraw = async (
    wallet: WalletContextState,
    amount: number
): Promise<string | null> => {
    console.log('withdraw: ', amount);
    if (wallet.publicKey === null) throw new WalletNotConnectedError();

    const program = getPresaleProgram(wallet);

    const globalStateKey = await keys.getGlobalStateKey();
    console.log('globalStateKey: ', globalStateKey.toBase58());

    const tx = new Transaction();

    const tokenVault = await getAssociatedTokenAddress(Constants.STAKE_TOKEN_MINT, globalStateKey, true); // Already created by owner
    console.log('tokenVault: ', tokenVault.toBase58());
    const userVault = await getAssociatedTokenAddress(Constants.STAKE_TOKEN_MINT, wallet.publicKey);
    console.log('userVault: ', userVault.toBase58());

    tx.add(
        await program.methods
            .withdraw(
                new anchor.BN(amount * Math.pow(10, Constants.DECIMALS))
            )
            .accounts({
                user: wallet.publicKey,
                globalState: globalStateKey,
                tokenMint: Constants.STAKE_TOKEN_MINT,
                tokenVault,
                userVault,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
                systemProgram: SystemProgram.programId,
            })
            .instruction()
    );

    return await send(connection, wallet, tx);
};

export const getStakeStateData = async () => {
    const program = getPresaleProgram(botKeyPair);
    const stateData = await program.account.stakeState.all();
    console.log("getPresaleStateData : ", stateData);
    // console.log("getUserStateData user: ", stateData[0].account.presalePrice.toString());

    return stateData;
}

export const getUserStateData = async (
    wallet: WalletContextState,
    cardNo: number
) => {

    const userStakeKey = await keys.getPresaleUserStateKey(wallet.publicKey!, cardNo);
    console.log('userStakeKey: ', userStakeKey.toBase58());

    const program = getPresaleProgram(botKeyPair);
    const stateData = await program.account.userState.fetchNullable(userStakeKey);
    console.log("getUserStateData222 : ", stateData);

    return stateData;
}


async function send(
    connection: Connection,
    wallet: WalletContextState,
    transaction: Transaction
) {
    const txHash = await sendTransaction(connection, wallet, transaction);
    if (txHash != null) {
        // let confirming_id = showToast("Confirming Transaction ...", -1, 2);
        let res = await connection.confirmTransaction(txHash);
        console.log(txHash);
        // toast.dismiss(confirming_id);
        // if (res.value.err) showToast("Transaction Failed", 2000, 1);
        // else showToast("Transaction Confirmed", 2000);
    } else {
        // showToast("Transaction Failed", 2000, 1);
    }
    return txHash;
}

export async function sendTransaction(
    connection: Connection,
    wallet: WalletContextState,
    transaction: Transaction
) {
    if (wallet.publicKey === null || wallet.signTransaction === undefined)
        return null;
    try {
        transaction.recentBlockhash = (
            await connection.getLatestBlockhash()
        ).blockhash;
        transaction.feePayer = wallet.publicKey;
        const signedTransaction = await wallet.signTransaction(transaction);
        const rawTransaction = signedTransaction.serialize();

        // showToast("Sending Transaction ...", 500);
        // notify({
        //   message: "Transaction",
        //   description: "Sending Transaction ...",
        //   duration: 0.5,
        // });

        const txid: TransactionSignature = await connection.sendRawTransaction(
            rawTransaction,
            {
                skipPreflight: true,
                preflightCommitment: "processed",
            }
        );
        return txid;
    } catch (e) {
        console.log("tx e = ", e);
        return null;
    }
}


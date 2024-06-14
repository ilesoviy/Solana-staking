import { PublicKey } from "@solana/web3.js";
import {
    GLOBAL_STATE_SEED,
    VAULT_SEED,
    USER_STATE_SEED,
    LOCKER_PROGRAM_ID,
    PRESALE_STATE_SEED,
    PRESALE_PROGRAM_ID,
} from "./constants.ts";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";

export const getGlobalStateKey = async () => {
    const [globalStateKey] = await asyncGetPda(
        [Buffer.from(GLOBAL_STATE_SEED)],
        PRESALE_PROGRAM_ID
    );
    return globalStateKey;
};

export const getVaultKey = async () => {
    const [vaultKey] = await asyncGetPda(
        [Buffer.from(VAULT_SEED)],
        LOCKER_PROGRAM_ID
    );
    return vaultKey;
};

export const getUserStateKey = async (userKey: PublicKey, mintKey: PublicKey) => {
    const [userStateKey] = await asyncGetPda(
        [Buffer.from(USER_STATE_SEED), userKey.toBuffer(), mintKey.toBuffer()],
        LOCKER_PROGRAM_ID
    );
    return userStateKey;
};

export const getAssociatedTokenAccount = async (ownerPubkey: PublicKey, mintPk: PublicKey) => {
    let associatedTokenAccountPubkey = (
        await PublicKey.findProgramAddress(
            [
                ownerPubkey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                mintPk.toBuffer(), // mint address
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        )
    )[0];
    return associatedTokenAccountPubkey;
};

// export const getTokenVault = async () => {
//     const toATA = await getAssociatedTokenAddress(mintKey, toWallet);

//   const [tokenVaultKey] = await asyncGetPda(
//     [Buffer.from(USER_STATE_SEED), userKey.toBuffer()],
//     PROGRAM_ID
//   );
//   return tokenVaultKey;
// };



const asyncGetPda = async (
    seeds: Buffer[],
    programId: PublicKey
): Promise<[PublicKey, number]> => {
    const [pubKey, bump] = await PublicKey.findProgramAddress(seeds, programId);
    return [pubKey, bump];
};



/////////////////////// Presale Hub ///////////////////////////

export const getPresaleStateKey = async (
    cardNo: number,
) => {
    // const [presaleStateKey] = await asyncGetPda(
    //     [ Buffer.from(PRESALE_STATE_SEED), new Uint8Array([cardNo])],
    //     PRESALE_PROGRAM_ID
    // );

    const [pubKey, bump] = await PublicKey.findProgramAddress(
        [ Buffer.from(PRESALE_STATE_SEED), new Uint8Array([cardNo])], 
        PRESALE_PROGRAM_ID
    );

    return pubKey;
};

export const getPresaleUserStateKey = async (
    userKey: PublicKey,
    cardNo: number
) => {
    console.log('======getPresaleUserStateKey: ', userKey.toBase58(), cardNo);

    // const [userStateKey] = await asyncGetPda(
    //     [Buffer.from(USER_STATE_SEED), userKey.toBuffer(), new Uint8Array([cardNo])],
    //     PRESALE_PROGRAM_ID
    // );

    const [pubKey, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(USER_STATE_SEED), userKey.toBuffer(), new Uint8Array([cardNo])], 
        PRESALE_PROGRAM_ID
    );

    return pubKey;
};
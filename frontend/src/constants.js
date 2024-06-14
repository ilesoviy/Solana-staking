import config from "./config";

export const NETWORK = config.isMainnet ? 'mainnet-beta' : 'devnet';

export const MAINNET_BUNDLR = "https://node1.bundlr.network";
export const DEVNET_BUNDLR = "https://devnet.bundlr.network";
export const BUNDLR_ADDR = config.isMainnet ? MAINNET_BUNDLR : DEVNET_BUNDLR;

export const TOKEN_TYPE = {
    SPL: 0,
    TOKEN2022: 1
}

export const COIN_TYPE = {
    SOL: 0,
    USDT: 1,
    USDC: 2
}

export const TOKEN_KIND = [
    {
        title: "Solana Program Library Token",
        name: "SPL Token",
        price: 0.5
    },
    {
        title: "Token 2022",
        name: "Token 2022",
        price: 1
    }
];

export const AUTHORITY_KIND = [
    {
        title: "Mint Authority",
        price: 0.1
    },
    {
        title: "Freeze Authority",
        price: 0.1
    }
];


export const FEE_BASIS_POINTS = 100; // 1%
export const MAX_FEE_AMOUNT = 5000; // 5,000 tokens

export const METADATA_2022_PROGRAM_ID = config.isMainnet ? 
    "META4s4fSmpkTbZoUsgC1oBnWB31vQcmnN8giPw51Zu"
    :
    "M1tgEZCz7fHqRAR3G5RLxU6c6ceQiZyFK7tzzy4Rof4";

export const METADATA_SPL_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

export const REVOKE_AUTHORITY_FEE = 0.1;
export const BURN_TOKEN_FEE = 0.1;
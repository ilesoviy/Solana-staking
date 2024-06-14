import { PublicKey } from "@solana/web3.js";

export const GLOBAL_STATE_SEED = "GLOBAL_STATE_SEED";
export const PRESALE_STATE_SEED = "STAKE_STATE_SEED";
export const VAULT_SEED = "VAULT_SEED";
export const USER_STATE_SEED = "USER_STATE_SEED";

// todo: for test, it is now one hour
// export const DAY_IN_MS = 3600 * 1000;
export const DAY_IN_MS = 3600 * 24 * 1000;
export const DAY_IN_SECS = 3600 * 24;
export const HOUR_IN_SECS = 3600;
// minimum amount to deposit
// should mul 10**decimals here to get real minimum
export const DEPOSIT_MINIMUM_AMOUNT = 100;
// tier starts from 0
export const DEFAULT_MAX_TIER = 2;

export const NETWORK = "devnet";

export const LOCKER_PROGRAM_ID = new PublicKey(
  "9bWDT41Ki1hrkw7LW82jXB4g8sQXfMyNN4zEF29ZNxDG",
);

export const PRESALE_PROGRAM_ID = new PublicKey(
  "5MLSiu1yAWEHoxMJeSrUBWaEKRjkH2RaMjAvzqzjVziW",
);

export const TREASURY = new PublicKey(
  "DvFvdQfkU5KqCniP51yT7ntBkbxNDVHs15DNxnKzveDL" //DvFvdQfkU5KqCniP51yT7ntBkbxNDVHs15DNxnKzveDL
);

export const STAKE_TOKEN_MINT = new PublicKey(
  "VvgeRQNHRHdYubKC9K2GN567LXTzSVcB7mpu7b1VF4r" //devnet: EJTkQVACn9LLyYzK84Nio1CeX9UhCp6RoyUvKe9SEN9t
);

export const DECIMALS = 9;
export const AFFILATE_FEE = 1; // 1%
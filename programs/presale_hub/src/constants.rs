pub const GLOBAL_STATE_SEED: &[u8] = b"GLOBAL_STATE_SEED";

pub const STAKE_STATE_SEED: &[u8] = b"STAKE_STATE_SEED";

pub const USER_STATE_SEED: &[u8] = b"USER_STATE_SEED";

pub const VAULT_SEED: &[u8] = b"VAULT_SEED";

//Staking card info
pub const STAKE_COUNT: u8 = 5; // 100%

pub const DENOMINATOR: u64 = 100000; // 100%
pub const WITHDRAW_FEE: u64 = 10000; // 10%

pub const STAKE_PERIODS: [u64; 5] = [30*86400, 90*86400, 180*86400, 365*86400, 1460*86400]; // [30 days, 90 days, 180 days, 1 year, 4 year]
pub const APYS: [u64; 5] = [25000, 50000, 75000, 100000, 125000]; // [25%, 50%, 75%, 100%, 125%]
pub const MIN_STAKE_AMOUNTS: [u64; 5] = [1000, 10000, 100000, 500000, 1000000];

// Constant

pub const YEAR_1: u64 = 365 * 86400;
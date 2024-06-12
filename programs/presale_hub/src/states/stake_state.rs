use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct StakeState {
    // Identity number
    pub card_no: u8,
    
    // Initialize
    pub is_initialized: u8,

    // Mint address of presale token
    pub token_mint: Pubkey,

    // Total staked token amount
    pub total_staked: u64,
    
    // Total claimed token amount
    pub total_claimed: u64,

    // Total staked token amount
    pub apy: u64,

    // Staking period
    pub stake_period: u64,
}
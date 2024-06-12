use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct GlobalState {
    // to avoid reinitialization attack
    pub is_initialized: u8,
    // admin
    pub authority: Pubkey,
    // vault
    pub vault: Pubkey,
    // treasury
    pub treasury: Pubkey,
    
    // these are constants
    pub deposit_fee: u64,
    pub withdraw_fee: u64,
    pub claim_fee: u64,
    pub ref_fee: u64,
    
    pub deposit_amount: u64,
    
    // Staking is started
    pub is_started: u8
}

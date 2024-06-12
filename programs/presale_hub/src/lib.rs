use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;
pub mod utils;

use instructions::*;

declare_id!("5MLSiu1yAWEHoxMJeSrUBWaEKRjkH2RaMjAvzqzjVziW");

#[program]
pub mod bobe_staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, new_authority: Pubkey) -> Result<()> {
        return initialize::handle(ctx, new_authority);
    }
    
    pub fn initialize_stake(ctx: Context<InitializeStake>, card_no: u8) -> Result<()> {
        return initialize_stake::initialize_stake(ctx, card_no);
    }

    pub fn stake_token(ctx: Context<StakeToken>, token_amount: u64, card_no: u8) -> Result<()> {
        return stake_token::stake_token(ctx, token_amount, card_no);
    }
    
    pub fn claim_token(ctx: Context<ClaimToken>, card_no: u8) -> Result<()> {
        return claim_token::claim_token(ctx, card_no);
    }

    pub fn withdraw_token(ctx: Context<WithdrawToken>, card_no: u8) -> Result<()> {
        return withdraw_token::withdraw_token(ctx, card_no);
    }
    
    pub fn deposit(ctx: Context<Deposit>, token_amount: u64) -> Result<()> {
        return deposit::deposit(ctx, token_amount);
    }
    
    pub fn withdraw(ctx: Context<Withdraw>, token_amount: u64) -> Result<()> {
        return withdraw::withdraw(ctx, token_amount);
    }
}

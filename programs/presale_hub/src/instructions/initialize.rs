use crate::{constants::*, errors::*, states::*};
use anchor_lang::prelude::*;
use solana_program::{program::invoke, system_instruction};
use std::mem::size_of;

use std::str::FromStr;
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        seeds = [GLOBAL_STATE_SEED],
        bump,
        space = 8 + size_of::<GlobalState>(),
        payer = authority,
    )]
    pub global_state: Account<'info, GlobalState>,

    /// CHECK: this should be set by admin
    pub treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> Initialize<'info> {
    pub fn validate(&self) -> Result<()> {
        if self.global_state.is_initialized == 1 {
            require!(
                self.global_state.authority.eq(&self.authority.key()),
                PresaleError::WrongQuoteToken
            )
        }
        Ok(())
    }
}

/// Initialize Staking Program for the first time
/// to init global state with some data for validation
///
#[access_control(ctx.accounts.validate())]
pub fn handle(ctx: Context<Initialize>, new_authority: Pubkey) -> Result<()> {
    let accts = ctx.accounts;
    accts.global_state.is_initialized = 1;
    accts.global_state.authority = new_authority;
    // accts.global_state.vault = accts.vault.key();
    accts.global_state.treasury = Pubkey::from_str("DvFvdQfkU5KqCniP51yT7ntBkbxNDVHs15DNxnKzveDL").unwrap();

    accts.global_state.deposit_fee = 1000; // 1%
    accts.global_state.withdraw_fee = 1000; // 1%
    accts.global_state.claim_fee = 1000; // 1%
    accts.global_state.ref_fee = 1000; // 1%
    
    accts.global_state.is_started = 0;

    Ok(())
}

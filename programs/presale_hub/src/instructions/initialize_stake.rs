use anchor_lang::prelude::*;
use solana_program::{
    program::{invoke},
    system_instruction
};

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Token, TokenAccount, Transfer},
};

use crate::{constants::*, states::*, errors::*};

#[derive(Accounts)]
#[instruction(
    card_no: u8
)]
pub struct InitializeStake<'info> {
    #[account(mut)]
    user: Signer<'info>,

    #[account(
        init,
        seeds = [STAKE_STATE_SEED, [card_no].as_ref()],
        bump,
        payer = user,
        space = 8 + std::mem::size_of::<StakeState>(),
    )]
    pub stake_state: Box<Account<'info, StakeState>>,

    #[account(mut)]
    pub token_mint: Account<'info, token::Mint>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>
}

pub fn initialize_stake(
    ctx: Context<InitializeStake>,
    card_no: u8,
) -> Result<()> {
    let accts = ctx.accounts;
    let stake_state = &mut accts.stake_state;

    require!(stake_state.is_initialized == 0, PresaleError::WrongQuoteToken);
    
    stake_state.is_initialized = 1;
    stake_state.card_no = card_no;
    stake_state.token_mint = accts.token_mint.key();
    
    Ok(())
}
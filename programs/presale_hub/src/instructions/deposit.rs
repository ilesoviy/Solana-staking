use anchor_lang::prelude::*;
use solana_program::{program::invoke, system_instruction};

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Token, TokenAccount, Transfer},
};

use crate::{constants::*, errors::*, states::*, utils::*};

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    user: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump,
      )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub token_mint: Account<'info, token::Mint>,

    #[account(mut, constraint = token_vault.owner == global_state.key())]
    pub token_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = user_vault.owner == user.key())]
    pub user_vault: Box<Account<'info, TokenAccount>>,
    
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

pub fn deposit(ctx: Context<Deposit>, token_amount: u64) -> Result<()> {
    let accts = ctx.accounts;
    let global_state = &mut accts.global_state;
    
    // Send Token
    let cpi_accounts = Transfer {
        from: accts.user_vault.to_account_info(),
        to: accts.token_vault.to_account_info(),
        authority: accts.user.to_account_info(),
    };
    let cpi_program = accts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, token_amount)?;

    global_state.deposit_amount = global_state.deposit_amount + token_amount;

    msg!("Successfully deposited: {}", token_amount);

    Ok(())
}

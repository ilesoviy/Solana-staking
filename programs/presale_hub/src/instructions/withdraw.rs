use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, MintTo, Token, TokenAccount, Transfer},
};

use crate::{constants::*, errors::*, states::*, utils::*};

#[derive(Accounts)]
#[instruction(
    card_no: u8
)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump,
      )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    token_mint: Account<'info, token::Mint>,

    #[account(mut, constraint = token_vault.owner == global_state.key())]
    pub token_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = user_vault.owner == user.key())]
    pub user_vault: Box<Account<'info, TokenAccount>>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let accts = ctx.accounts;
    let global_state: &mut Account<GlobalState> = &mut accts.global_state;

    let amt: u64 = accts.token_vault.amount;
    require!(amount <= amt, PresaleError::InvalidAmount);

    require!(accts.user.key() == global_state.authority, PresaleError::Unauthorized);

    // Send Token
    let bump = ctx.bumps.global_state;
    let global_state_seed: &[&[&[u8]]] = &[&[&GLOBAL_STATE_SEED, &[bump]]];
    let cpi_accounts = Transfer {
        from: accts.token_vault.to_account_info(),
        to: accts.user_vault.to_account_info(),
        authority: global_state.to_account_info(),
    };

    let cpi_program = accts.token_program.to_account_info();
    let cpi_ctx: CpiContext<Transfer> = CpiContext::new_with_signer(cpi_program, cpi_accounts, global_state_seed);

    token::transfer(cpi_ctx, amount)?;

    msg!("Successfully withdrawed: {}", amount);

    Ok(())
}

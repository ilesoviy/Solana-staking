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
pub struct WithdrawToken<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump,
      )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [STAKE_STATE_SEED, [card_no].as_ref()],
        bump
    )]
    pub stake_state: Box<Account<'info, StakeState>>,

    #[account(
        mut,
        seeds = [USER_STATE_SEED, user.key().as_ref(), [card_no].as_ref()],
        bump,
    )]
    pub user_state: Box<Account<'info, UserState>>,

    #[account(mut)]
    token_mint: Account<'info, token::Mint>,

    #[account(mut, constraint = token_vault.owner == global_state.key())]
    pub token_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = user_vault.owner == user.key())]
    pub user_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = treasury_vault.owner == global_state.treasury)]
    pub treasury_vault: Box<Account<'info, TokenAccount>>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn withdraw_token(ctx: Context<WithdrawToken>, card_no: u8) -> Result<()> {
    let accts = ctx.accounts;
    let global_state = &mut accts.global_state;
    let stake_state = &mut accts.stake_state;
    let user_state = &mut accts.user_state;

    require!(
        stake_state.is_initialized == 1,
        PresaleError::NotStarted
    );

    let cur_timestamp = Clock::get()?.unix_timestamp as u64;

    require!(
        user_state.stake_amount > 0,
        PresaleError::InsufficientClaimableAmount
    );

    require!(cur_timestamp > user_state.stake_time + STAKE_PERIODS[card_no as usize], PresaleError::NotEndedYet);

    let reward_amount = calc_rewards(&user_state, card_no)?; //user_state.stake_amount * APYS[card_no as usize] / DENOMINATOR;
    let mut withdraw_amount = user_state.stake_amount + reward_amount;
    let withdraw_fee = withdraw_fee(&global_state, withdraw_amount)?;
    withdraw_amount = withdraw_amount - withdraw_fee;
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

    token::transfer(cpi_ctx, withdraw_amount)?;

    // Send withdraw fee
    let cpi_accounts2 = Transfer {
        from: accts.token_vault.to_account_info(),
        to: accts.treasury_vault.to_account_info(),
        authority: global_state.to_account_info(),
    };

    let cpi_program2 = accts.token_program.to_account_info();
    let cpi_ctx2: CpiContext<Transfer> = CpiContext::new_with_signer(cpi_program2, cpi_accounts2, global_state_seed);

    token::transfer(cpi_ctx2, withdraw_fee)?;

    msg!("Successfully withdrawed: {}", withdraw_amount + withdraw_fee);

    stake_state.total_staked = stake_state.total_staked - user_state.stake_amount;
    
    user_state.stake_amount = 0;

    Ok(())
}

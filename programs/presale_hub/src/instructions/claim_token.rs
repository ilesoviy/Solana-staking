use anchor_lang::prelude::*;

use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{constants::*, errors::*, states::*, utils::*};

#[derive(Accounts)]
#[instruction(
    card_no: u8
)]
pub struct ClaimToken<'info> {
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
    pub token_mint: Box<Account<'info, token::Mint>>,

    #[account(mut, constraint = token_vault.owner == global_state.key())]
    token_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = user_vault.owner == user.key())]
    user_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = treasury_vault.owner == global_state.treasury)]
    pub treasury_vault: Box<Account<'info, TokenAccount>>,

    // #[account(constraint = token_program.key == &token::ID)]
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

pub fn claim_token(ctx: Context<ClaimToken>, card_no: u8) -> Result<()> {
    let accts = ctx.accounts;
    let global_state = &mut accts.global_state;
    let stake_state = &mut accts.stake_state;
    let user_state: &mut Box<Account<UserState>> = &mut accts.user_state;

    require!(
        stake_state.is_initialized == 1,
        PresaleError::InsufficientClaimableAmount
    );

    let cur_timestamp = Clock::get()?.unix_timestamp as u64;

    require!(
        user_state.stake_amount > 0,
        PresaleError::InsufficientClaimableAmount
    );

    require!(cur_timestamp > user_state.claim_time + 7 * 86400, PresaleError::NotEndedYet);

    let mut reward_amount = calc_rewards(&user_state, card_no)?; //user_state.stake_amount * APYS[card_no as usize] / DENOMINATOR;
    let claim_fee = claim_fee(&global_state, reward_amount)?;
    reward_amount = reward_amount - claim_fee;
    user_state.claim_amount = user_state.claim_amount + reward_amount;
    // user_state.stake_time = cur_timestamp;
    user_state.claim_time = cur_timestamp;

    stake_state.total_claimed = stake_state.total_claimed + reward_amount;

    // Send Token
    let bump = ctx.bumps.global_state;
    let global_state_seed: &[&[&[u8]]] = &[&[&GLOBAL_STATE_SEED, &[bump]]];

    let cpi_accounts = Transfer {
        from: accts.token_vault.to_account_info(),
        to: accts.user_vault.to_account_info(),
        authority: global_state.to_account_info(),
    };

    let cpi_program: AccountInfo = accts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, global_state_seed);

    token::transfer(cpi_ctx, reward_amount)?;

    // Send claim fee
    let cpi_accounts2 = Transfer {
        from: accts.token_vault.to_account_info(),
        to: accts.treasury_vault.to_account_info(),
        authority: global_state.to_account_info(),
    };

    let cpi_program2: AccountInfo = accts.token_program.to_account_info();
    let cpi_ctx2: CpiContext<Transfer> = CpiContext::new_with_signer(cpi_program2, cpi_accounts2, global_state_seed);

    token::transfer(cpi_ctx2, claim_fee)?;

    msg!("Successfully claimed: {}", reward_amount + claim_fee);

    Ok(())
}

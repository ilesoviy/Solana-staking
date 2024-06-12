use anchor_lang::prelude::*;
use solana_program::{program::invoke, system_instruction};

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Token, TokenAccount, Transfer},
};

use crate::{constants::*, errors::*, states::*, utils::*};

#[derive(Accounts)]
#[instruction(
    token_amount: u64,
    card_no: u8
)]
pub struct StakeToken<'info> {
    #[account(mut)]
    user: Signer<'info>,

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
        init_if_needed,
        seeds = [USER_STATE_SEED, user.key().as_ref(), [card_no].as_ref()],
        bump,
        payer = user,
        space = 8 + std::mem::size_of::<UserState>(),
    )]
    pub user_state: Box<Account<'info, UserState>>,

    #[account(mut)]
    pub token_mint: Account<'info, token::Mint>,

    #[account(mut, constraint = token_vault.owner == global_state.key())]
    pub token_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = user_vault.owner == user.key())]
    pub user_vault: Box<Account<'info, TokenAccount>>,
    
    #[account(mut, constraint = treasury_vault.owner == global_state.treasury)]
    pub treasury_vault: Box<Account<'info, TokenAccount>>,
    
    #[account(mut)]
    pub referrer_vault: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

pub fn stake_token(ctx: Context<StakeToken>, token_amount: u64, card_no: u8) -> Result<()> {
    let accts = ctx.accounts;
    let stake_state = &mut accts.stake_state;
    let user_state = &mut accts.user_state;

    require!(
        stake_state.is_initialized == 1,
        PresaleError::InsufficientClaimableAmount
    );

    let cur_timestamp = u64::try_from(Clock::get()?.unix_timestamp).unwrap();

    require!(card_no < STAKE_COUNT, PresaleError::InvalidPool);
    // decimals
    require!(
        token_amount >= MIN_STAKE_AMOUNTS[card_no as usize],
        PresaleError::InvalidAmount
    );

    let stake_fee = deposit_fee(&accts.global_state, token_amount)?;
    let referral_fee = ref_fee(&accts.global_state, token_amount)?;
    let real_amount = token_amount - stake_fee - referral_fee;
    // Send Token
    let cpi_accounts = Transfer {
        from: accts.user_vault.to_account_info(),
        to: accts.token_vault.to_account_info(),
        authority: accts.user.to_account_info(),
    };
    let cpi_program = accts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, real_amount)?;

    let cpi_accounts2 = Transfer {
        from: accts.user_vault.to_account_info(),
        to: accts.treasury_vault.to_account_info(),
        authority: accts.user.to_account_info(),
    };
    let cpi_program2 = accts.token_program.to_account_info();
    let cpi_ctx2 = CpiContext::new(cpi_program2, cpi_accounts2);
    token::transfer(cpi_ctx2, stake_fee)?;
    
    let cpi_accounts3 = Transfer {
        from: accts.user_vault.to_account_info(),
        to: accts.referrer_vault.to_account_info(),
        authority: accts.user.to_account_info(),
    };
    let cpi_program3 = accts.token_program.to_account_info();
    let cpi_ctx3 = CpiContext::new(cpi_program3, cpi_accounts3);
    token::transfer(cpi_ctx3, referral_fee)?;

    user_state.card_no = card_no;
    user_state.stake_amount = user_state.stake_amount + (token_amount-stake_fee);
    user_state.stake_time = cur_timestamp;
    user_state.claim_time = cur_timestamp;

    stake_state.total_staked = stake_state.total_staked + (token_amount-stake_fee);

    Ok(())
}

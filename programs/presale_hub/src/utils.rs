use anchor_lang::prelude::*;
use crate::{constants::*, error::*, instructions::*, states::*};

pub fn deposit_fee(global_state: &GlobalState, amount: u64) -> Result<u64> {
    let res = (amount as u128) * (global_state.deposit_fee as u128) / (DENOMINATOR as u128);
    Ok(res as u64)
}

pub fn withdraw_fee(global_state: &GlobalState, amount: u64) -> Result<u64> {
    let res = (amount as u128) * (global_state.withdraw_fee as u128) / (DENOMINATOR as u128);
    Ok(res as u64)
}

pub fn claim_fee(global_state: &GlobalState, amount: u64) -> Result<u64> {
    let res = (amount as u128) * (global_state.claim_fee as u128) / (DENOMINATOR as u128);
    Ok(res as u64)
}

pub fn ref_fee(global_state: &GlobalState, amount: u64) -> Result<u64> {
    let res = (amount as u128) * (global_state.ref_fee as u128) / (DENOMINATOR as u128);
    Ok(res as u64)
}

pub fn calc_rewards(user_state: &UserState, card_no: u8) -> Result<u64> {
    let mut res = (user_state.stake_amount as u128) * (APYS[card_no as usize] as u128) / (DENOMINATOR as u128);
    
    let cur_timestamp = Clock::get()?.unix_timestamp as u64;
    let reward_time: u64;
    if user_state.claim_time == 0 {
        reward_time = user_state.stake_time;
    } else {
        reward_time = user_state.claim_time;
    }
     
    let stake_period = cur_timestamp
        .checked_sub(reward_time)
        .unwrap();
    res = res.checked_mul(stake_period as u128)
        .unwrap()
        .checked_div(YEAR_1 as u128)
        .unwrap();

    Ok(res as u64)
}
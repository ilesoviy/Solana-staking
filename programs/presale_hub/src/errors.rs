use anchor_lang::prelude::*;

#[error_code]
pub enum PresaleError {
    #[msg("Staking card was already created")]
    AlreadyCreated,
    
    #[msg("Staking not started yet")]
    NotStarted,
    
    #[msg("Staking already ended")]
    AlreadyEnded,
    
    #[msg("Staking not ended yet")]
    NotEndedYet,
    
    #[msg("Insufficient quote token amount")]
    InsufficientQuoteTokenAmount,
    
    #[msg("Quote token is wrong")]
    WrongQuoteToken,
    
    #[msg("Buy token amount is out of valid range")]
    InvalidBuyAmount,

    #[msg("Insufficient claimable token amount")]
    InsufficientClaimableAmount,

    #[msg("Unauthorized")]
    Unauthorized,
    
    #[msg("Invalid amount")]
    InvalidAmount,
    
    #[msg("Invalid pool number")]
    InvalidPool,
}
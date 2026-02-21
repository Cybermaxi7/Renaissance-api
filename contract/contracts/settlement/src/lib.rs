#![no_std]
use common::{
    cleanup_operation, ensure_not_replayed, is_operation_executed, ContractError,
    SettlementExecutedEvent,
};
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, Symbol, U256};

#[contracttype]
#[derive(Clone)]
enum DataKey {
    BackendSigner,
}

#[contract]
pub struct SettlementContract;

#[contractimpl]
impl SettlementContract {
    pub fn initialize(env: Env, backend_signer: Address) {
        env.storage()
            .persistent()
            .set(&DataKey::BackendSigner, &backend_signer);
    }

    pub fn settle_bet(
        env: Env,
        operation_hash: BytesN<32>,
        bet_id: U256,
        winner: Address,
        payout: i128,
        ttl_seconds: Option<u64>,
    ) -> Result<(), ContractError> {
        Self::require_backend_auth(&env)?;
        ensure_not_replayed(
            &env,
            Symbol::new(&env, "settlement"),
            operation_hash.clone(),
            ttl_seconds,
        )?;

        let event = SettlementExecutedEvent {
            operation_hash,
            bet_id,
            winner,
            payout,
            timestamp: env.ledger().timestamp(),
        };

        env.events()
            .publish((Symbol::new(&env, "settlement_executed"),), event);

        Ok(())
    }

    pub fn is_operation_executed(env: Env, operation_hash: BytesN<32>) -> bool {
        is_operation_executed(&env, Symbol::new(&env, "settlement"), operation_hash)
    }

    pub fn cleanup_operation(env: Env, operation_hash: BytesN<32>) -> bool {
        cleanup_operation(&env, Symbol::new(&env, "settlement"), operation_hash)
    }

    fn require_backend_auth(env: &Env) -> Result<(), ContractError> {
        let backend_signer: Address = env
            .storage()
            .persistent()
            .get(&DataKey::BackendSigner)
            .ok_or(ContractError::Unauthorized)?;
        backend_signer.require_auth();
        Ok(())
    }
}

#[cfg(test)]
mod test;

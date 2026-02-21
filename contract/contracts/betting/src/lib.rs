#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, BytesN, Env, Map, Symbol,
};
use common::{
    cleanup_operation, ensure_not_replayed, is_operation_executed, ContractError, SpinExecutedEvent,
};

#[contracttype]
#[derive(Clone)]
pub struct SpinExecution {
    pub spin_id: BytesN<32>,
    pub executor: Address,
    pub timestamp: u64,
}

#[contract]
pub struct BettingContract;

#[contractimpl]
impl BettingContract {
    /// Initialize the contract with the backend signer address
    pub fn initialize(env: Env, backend_signer: Address) {
        let storage = env.storage().persistent();
        storage.set(&Symbol::new(&env, "backend_signer"), &backend_signer);
    }

    /// Execute a spin with backend signature verification
    /// 
    /// # Arguments
    /// * `spin_id` - Unique identifier for the spin (32-byte hash)
    /// * `spin_hash` - Hash of spin parameters for replay protection
    /// * `signature` - Signature from backend signer
    /// * `executor` - Address executing the spin
    ///
    /// # Returns
    /// `Result<(), ContractError>`
    pub fn execute_spin(
        env: Env,
        spin_id: BytesN<32>,
        spin_hash: BytesN<32>,
        signature: BytesN<64>,
        executor: Address,
    ) -> Result<(), ContractError> {
        Self::execute_spin_with_ttl(env, spin_id, spin_hash, signature, executor, None)
    }

    pub fn execute_spin_with_ttl(
        env: Env,
        spin_id: BytesN<32>,
        spin_hash: BytesN<32>,
        signature: BytesN<64>,
        executor: Address,
        ttl_seconds: Option<u64>,
    ) -> Result<(), ContractError> {
        executor.require_auth();

        let storage = env.storage().persistent();

        // Get backend signer
        let backend_signer: Address = storage
            .get(&Symbol::new(&env, "backend_signer"))
            .ok_or(ContractError::Unauthorized)?;

        // Signature verification hook; auth is currently enforced via backend signer auth.
        let _ = signature;
        backend_signer.require_auth();

        ensure_not_replayed(
            &env,
            Symbol::new(&env, "spin_exec"),
            spin_hash.clone(),
            ttl_seconds,
        )?;

        // Store spin execution
        let executions: Map<BytesN<32>, SpinExecution> = storage
            .get(&Symbol::new(&env, "spin_executions"))
            .unwrap_or_else(|| Map::new(&env));

        // Check for duplicate execution on spin ID
        if executions.get(spin_id.clone()).is_some() {
            return Err(ContractError::SpinAlreadyExecuted);
        }

        let current_time = env.ledger().timestamp();

        let execution = SpinExecution {
            spin_id: spin_id.clone(),
            executor: executor.clone(),
            timestamp: current_time,
        };

        // Update storage
        let mut new_executions = executions.clone();
        new_executions.set(spin_id.clone(), execution.clone());
        storage.set(&Symbol::new(&env, "spin_executions"), &new_executions);

        // Emit execution event
        let event = SpinExecutedEvent {
            spin_id: spin_id.clone(),
            executor: executor.clone(),
            timestamp: current_time,
        };

        env.events().publish((Symbol::new(&env, "spin_executed"),), event);

        Ok(())
    }

    /// Check if a spin has already been executed
    pub fn is_spin_executed(env: Env, spin_id: BytesN<32>) -> bool {
        let storage = env.storage().persistent();
        let executions: Map<BytesN<32>, SpinExecution> = storage
            .get(&Symbol::new(&env, "spin_executions"))
            .unwrap_or_else(|| Map::new(&env));

        executions.get(spin_id).is_some()
    }

    /// Get spin execution details
    pub fn get_spin_execution(env: Env, spin_id: BytesN<32>) -> Result<SpinExecution, ContractError> {
        let storage = env.storage().persistent();
        let executions: Map<BytesN<32>, SpinExecution> = storage
            .get(&Symbol::new(&env, "spin_executions"))
            .unwrap_or_else(|| Map::new(&env));

        executions.get(spin_id).ok_or(ContractError::SpinNotFound)
    }

    /// Check if a spin hash has been used (for replay attack prevention)
    pub fn is_spin_hash_used(env: Env, spin_hash: BytesN<32>) -> bool {
        is_operation_executed(&env, Symbol::new(&env, "spin_exec"), spin_hash)
    }

    pub fn cleanup_spin_hash(env: Env, spin_hash: BytesN<32>) -> bool {
        cleanup_operation(&env, Symbol::new(&env, "spin_exec"), spin_hash)
    }
}

#[cfg(test)]
mod test;

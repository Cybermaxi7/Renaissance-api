#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, testutils::Ledger, Address, BytesN, Env, U256};

#[test]
fn rejects_duplicate_operation_ids() {
    let env = Env::default();
    env.mock_all_auths();

    let backend = Address::generate(&env);
    let winner = Address::generate(&env);
    let contract_id = env.register(SettlementContract, ());
    let client = SettlementContractClient::new(&env, &contract_id);
    let operation_hash = BytesN::from_array(&env, &[11u8; 32]);

    client.initialize(&backend);

    client.settle_bet(
        &operation_hash,
        &U256::from_u32(&env, 7),
        &winner,
        &1_250,
        &None,
    );

    assert_eq!(
        client.try_settle_bet(
            &operation_hash,
            &U256::from_u32(&env, 8),
            &winner,
            &1_900,
            &None,
        ),
        Err(Ok(ContractError::DuplicateOperation))
    );
}

#[test]
fn supports_ttl_cleanup_for_operations() {
    let env = Env::default();
    env.mock_all_auths();

    let backend = Address::generate(&env);
    let winner = Address::generate(&env);
    let contract_id = env.register(SettlementContract, ());
    let client = SettlementContractClient::new(&env, &contract_id);
    let operation_hash = BytesN::from_array(&env, &[22u8; 32]);

    client.initialize(&backend);

    client.settle_bet(
        &operation_hash,
        &U256::from_u32(&env, 5),
        &winner,
        &300,
        &Some(5),
    );
    assert!(client.is_operation_executed(&operation_hash));

    env.ledger().with_mut(|li| {
        li.timestamp += 6;
    });

    assert!(client.cleanup_operation(&operation_hash));
    assert!(!client.is_operation_executed(&operation_hash));

    client.settle_bet(
        &operation_hash,
        &U256::from_u32(&env, 6),
        &winner,
        &450,
        &Some(5),
    );
}

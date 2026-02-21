#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, testutils::Ledger, Address, BytesN, Env};

#[test]
fn executes_spin_once_per_spin_id() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let executor = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let spin_id = BytesN::from_array(&env, &[1u8; 32]);
    let spin_hash = BytesN::from_array(&env, &[2u8; 32]);
    let signature = BytesN::from_array(&env, &[3u8; 64]);

    client.execute_spin(&spin_id, &spin_hash, &signature, &executor);
    assert_eq!(
        client.try_execute_spin(&spin_id, &spin_hash, &signature, &executor),
        Err(Ok(ContractError::DuplicateOperation))
    );
}

#[test]
fn rejects_replay_by_spin_hash() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let executor = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let spin_hash = BytesN::from_array(&env, &[9u8; 32]);
    let signature = BytesN::from_array(&env, &[4u8; 64]);

    client.execute_spin(
        &BytesN::from_array(&env, &[7u8; 32]),
        &spin_hash,
        &signature,
        &executor,
    );

    assert_eq!(
        client.try_execute_spin(
            &BytesN::from_array(&env, &[8u8; 32]),
            &spin_hash,
            &signature,
            &executor,
        ),
        Err(Ok(ContractError::DuplicateOperation))
    );
}

#[test]
fn reports_spin_hash_usage() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let executor = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let spin_id = BytesN::from_array(&env, &[10u8; 32]);
    let spin_hash = BytesN::from_array(&env, &[11u8; 32]);
    let signature = BytesN::from_array(&env, &[5u8; 64]);

    assert!(!client.is_spin_hash_used(&spin_hash));
    client.execute_spin(&spin_id, &spin_hash, &signature, &executor);
    assert!(client.is_spin_hash_used(&spin_hash));
}

#[test]
fn supports_ttl_cleanup_for_spin_hashes() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let executor = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let spin_id = BytesN::from_array(&env, &[12u8; 32]);
    let spin_hash = BytesN::from_array(&env, &[13u8; 32]);
    let signature = BytesN::from_array(&env, &[6u8; 64]);

    client.execute_spin_with_ttl(&spin_id, &spin_hash, &signature, &executor, &Some(5));
    assert!(client.is_spin_hash_used(&spin_hash));

    env.ledger().with_mut(|li| {
        li.timestamp += 6;
    });

    assert!(client.cleanup_spin_hash(&spin_hash));
    assert!(!client.is_spin_hash_used(&spin_hash));
}

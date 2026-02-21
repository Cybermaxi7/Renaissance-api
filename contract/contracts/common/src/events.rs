use soroban_sdk::{contracttype, Address, BytesN, Env, Map, String, Symbol, U256};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SpinExecutedEvent {
    pub spin_id: BytesN<32>,
    pub executor: Address,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SettlementExecutedEvent {
    pub operation_hash: BytesN<32>,
    pub bet_id: U256,
    pub winner: Address,
    pub payout: i128,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFTMintEvent {
    pub token_id: U256,
    pub to: Address,
    pub token_uri: String,
    pub nft_contract: Address,
    pub timestamp: u64,
    pub mint_type: Symbol,
    pub metadata: Map<Symbol, String>,
    pub price: Option<i128>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReplayRejectedEvent {
    pub operation_hash: BytesN<32>,
    pub scope: Symbol,
    pub timestamp: u64,
}

pub const NFT_MINT_EVENT: Symbol = Symbol::short("NFT_MINT");

pub fn create_nft_mint_event(
    env: &Env,
    token_id: U256,
    to: Address,
    token_uri: String,
    nft_contract: Address,
    mint_type: Symbol,
    price: Option<i128>,
) -> NFTMintEvent {
    NFTMintEvent {
        token_id,
        to,
        token_uri,
        nft_contract,
        timestamp: 0,
        mint_type,
        metadata: Map::new(env),
        price,
    }
}

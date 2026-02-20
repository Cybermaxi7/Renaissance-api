use soroban_sdk::{Address, String};

pub struct Minted {
    pub token_id: u64,
    pub to: Address,
    pub token_uri: String,
}

pub struct Transferred {
    pub token_id: u64,
    pub from: Address,
    pub to: Address,
}

pub struct Initialized {
    pub admin: Address,
}

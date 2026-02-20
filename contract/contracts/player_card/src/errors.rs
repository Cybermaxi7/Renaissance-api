use soroban_sdk::contracterror;

#[contracterror]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    NotAdmin = 3,
    NotTokenOwner = 4,
    TokenNotFound = 5,
    BurnDisabled = 6,
    InvalidRecipient = 7,
}

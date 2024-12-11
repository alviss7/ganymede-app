use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ItemName {
    pub fr: String,
    pub en: String,
    pub es: String,
    pub pt: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Item {
    pub name: ItemName,
    pub img: Option<String>,
}

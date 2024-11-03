use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ItemName {
    pub fr: String,
    pub en: String,
    pub de: String,
    pub es: String,
    pub it: String,
    pub pt: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Item {
    pub name: ItemName,
    #[serde(rename = "createdAt")]
    created_at: String,
    #[serde(rename = "updatedAt")]
    updated_at: String,
    pub img: Option<String>,
}

use chrono::Datelike;
use serde::{Deserialize, Serialize};
use tauri_plugin_http::reqwest;

use crate::error::Error;

const DOFUSDB_API: &str = "https://api.dofusdb.fr";

#[derive(Serialize, Deserialize)]
pub struct Almanax {
    pub id: u32,
    pub desc: Description,
}

#[derive(Serialize, Deserialize)]
pub struct Description {
    pub fr: String,
    pub es: String,
    pub en: String,
    pub pt: String,
}

#[derive(Serialize, Deserialize)]
pub struct QuestStep {
    description: Description,
}

#[derive(Serialize, Deserialize)]
pub struct Quest {}

#[derive(Serialize, Deserialize)]
pub struct QuestData {
    data: Vec<Quest>,
}

pub async fn get_quest_data(id: u32) -> Result<QuestData, Error> {
    let res = reqwest::get(format!(
        "{}/quests?startCriterion[$regex]=Ad={}",
        DOFUSDB_API, id
    ))
    .await?;

    let text = res.text().await?;

    let json = crate::json::from_str::<QuestData>(text.as_str());

    match json {
        Err(err) => {
            eprintln!("Failed to get quest data: {:?}", err);

            Err(Error::from(err))
        }
        Ok(json) => Ok(json),
    }
}

#[tauri::command]
pub async fn get_almanax() -> Result<Almanax, Error> {
    let date = chrono::offset::Local::now();
    let day = date.day();
    let month = date.month();
    let year = date.year();
    let res = reqwest::get(format!(
        "{}/almanax?date={}/{}/{}",
        DOFUSDB_API, month, day, year
    ))
    .await?;

    let text = res.text().await?;

    let json = crate::json::from_str::<Almanax>(text.as_str());

    if let Err(err) = &json {
        eprintln!("Failed to get almanax: {:?}", err);

        return Err(Error::from(err));
    }

    let almanax = json.unwrap();

    let quest_data = get_quest_data(almanax.id).await?;
}

use serde::Serialize;

use crate::error::Error;

pub const DOFUSDB_API: &str = "https://api.dofusdb.fr";
#[cfg(debug_assertions)]
pub const GANYMEDE_API: &str = "https://dev.ganymede-dofus.com/api";
#[cfg(not(debug_assertions))]
pub const GANYMEDE_API: &str = "https://ganymede-dofus.com/api";
#[cfg(debug_assertions)]
pub const GANYMEDE_API_V2: &str = "https://dev.ganymede-dofus.com/api/v2";
#[cfg(not(debug_assertions))]
pub const GANYMEDE_API_V2: &str = "https://ganymede-dofus.com/api/v2";

#[derive(Serialize)]
struct DownloadedBody {
    #[serde(rename = "uniqueID")]
    unique_id: String,
    version: String,
    os: String,
}

fn os_to_string(os: String) -> Option<String> {
    match os.as_str() {
        "windows" => Some("Windows".into()),
        "macos" => Some("Mac_OS".into()),
        "linux" => Some("linux".into()),
        _ => None,
    }
}

pub async fn increment_app_download_count(
    version: String,
) -> Result<tauri_plugin_http::reqwest::Response, Error> {
    let id = machine_uid::get().unwrap();
    let os = std::env::consts::OS.to_string();
    let os = os_to_string(os);

    println!(
        "Incrementing app download count, id: {} - version: {} - os: {:?}",
        id, version, os
    );

    if os.is_none() {
        return Err(Error::EarlyReturn);
    }

    let os = os.unwrap();

    let body = DownloadedBody {
        unique_id: id,
        version,
        os,
    };

    let body = serde_json::to_string(&body).unwrap();

    println!("body: {}", body);

    let res = tauri_plugin_http::reqwest::ClientBuilder::new()
        .user_agent("GANYMEDE_TAURI_APP")
        .build()?
        .post(format!("{}/downloaded", GANYMEDE_API))
        .header("Content-Type", "application/json")
        .body(body)
        .send()
        .await
        .map_err(Error::from);

    match res {
        Ok(res) => {
            if res.status().is_success() {
                Ok(res)
            } else {
                Err(Error::from(format!(
                    "Failed to increment app download count: status={}",
                    res.status().as_str()
                )))
            }
        }
        Err(err) => Err(Error::from(format!(
            "Failed to increment app download count: {:?}",
            err
        ))),
    }
}

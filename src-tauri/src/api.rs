use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Runtime};

#[cfg(not(debug_assertions))]
use crate::error::Error;

pub const DOFUSDB_API: &str = "https://api.dofusdb.fr";
#[cfg(not(debug_assertions))]
pub const GANYMEDE_API: &str = "https://ganymede-dofus.com/api";
#[cfg(debug_assertions)]
pub const GANYMEDE_API_V2: &str = "https://dev.ganymede-dofus.com/api/v2";
#[cfg(not(debug_assertions))]
pub const GANYMEDE_API_V2: &str = "https://ganymede-dofus.com/api/v2";

const GITHUB_API: &str = "https://api.github.com/repos/GanymedeTeam/ganymede-app";

#[cfg(not(debug_assertions))]
#[derive(Serialize)]
struct DownloadedBody {
    #[serde(rename = "uniqueID")]
    unique_id: String,
    version: String,
    os: String,
}

#[cfg(not(debug_assertions))]
fn os_to_string(os: String) -> Option<String> {
    match os.as_str() {
        "windows" => Some("Windows".into()),
        "macos" => Some("Mac_OS".into()),
        "linux" => Some("linux".into()),
        _ => None,
    }
}

#[cfg(not(debug_assertions))]
pub async fn increment_app_download_count(
    version: String,
) -> Result<tauri_plugin_http::reqwest::Response, Error> {
    let id = machine_uid::get().unwrap();
    let os = std::env::consts::OS.to_string();
    let os = os_to_string(os);

    println!(
        "api://Incrementing app download count, id: {} - version: {} - os: {:?}",
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

#[derive(Deserialize)]
struct AppRelease {
    tag_name: String,
}

#[derive(Serialize)]
pub enum AppVersionError {
    GitHub,
    Json,
    Semver,
}

#[tauri::command]
pub async fn is_app_version_old<R: Runtime>(app: AppHandle<R>) -> Result<bool, AppVersionError> {
    let version = app.package_info().version.to_string();

    let client = tauri_plugin_http::reqwest::ClientBuilder::new()
        .user_agent("GANYMEDE_TAURI_APP")
        .build()
        .unwrap();

    let res = client
        .get(format!("{}/releases/latest", GITHUB_API))
        .send()
        .await;

    if res.is_err() {
        eprintln!(
            "api://failed to get latest version: {:?}",
            res.err().unwrap()
        );

        return Err(AppVersionError::GitHub);
    }

    let res = res.unwrap().json::<AppRelease>().await;

    if res.is_err() {
        return Err(AppVersionError::Json);
    }

    let res = res.unwrap();

    let release_version = semver::VersionReq::parse(format!("<{}", res.tag_name).as_str());

    if release_version.is_err() {
        return Err(AppVersionError::Semver);
    }

    let release_version = release_version.unwrap();
    let version = semver::Version::parse(&version).unwrap();

    println!(
        "api://version: {:?} - release_version: {:?}",
        version, release_version
    );

    Ok(release_version.matches(&version))
}

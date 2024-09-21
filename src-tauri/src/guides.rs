use crate::error::Error;
use crate::tauri_api::DownloadPath;
use serde::{Deserialize, Serialize};
use std::{fmt, fs};
use tauri::path::PathResolver;
use tauri::{Manager, Runtime, Window, Wry};
use tauri_plugin_http::reqwest;

#[derive(Serialize, Deserialize, Clone)]
pub struct User {
    pub id: u32,
    pub name: String,
    pub is_admin: u8,
    pub is_certified: u8,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum Lang {
    En,
    Fr,
    Es,
    Pt,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum Status {
    Draft,
    Public,
    Private,
    Certified,
    Gp,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Step {
    pub name: Option<String>,
    pub map: String,
    pub pos_x: i32,
    pub pos_y: i32,
    pub text: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Guide {
    pub id: u32,
    pub name: String,
    pub description: Option<String>,
    pub status: Status,
    pub likes: u32,
    pub dislikes: u32,
    pub downloads: Option<u32>,
    pub created_at: String,
    pub deleted_at: Option<String>,
    pub updated_at: Option<String>,
    pub lang: Lang,
    pub order: u32,
    pub user: User,
    pub user_id: u32,
    pub web_description: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GuideWithSteps {
    pub id: u32,
    pub name: String,
    pub description: Option<String>,
    pub status: Status,
    pub likes: u32,
    pub dislikes: u32,
    pub downloads: Option<u32>,
    pub deleted_at: Option<String>,
    pub updated_at: Option<String>,
    pub lang: Lang,
    pub order: u32,
    pub user: User,
    pub web_description: Option<String>,
    pub steps: Vec<Step>
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct Download {
    pub downloaded_guides: Vec<GuideWithSteps>,
}

impl fmt::Display for Status {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        let status_str = match self {
            Status::Draft => "draft",
            Status::Public => "public",
            Status::Private => "private",
            Status::Certified => "certified",
            Status::Gp => "gp",
        };
        write!(formatter, "{}", status_str)
    }
}

impl Download {
    pub fn get<R: Runtime>(resolver: &PathResolver<R>) -> Result<Download, Error> {
        let download_path = resolver.app_download_file();

        let file = fs::read_to_string(download_path);

        match file {
            Err(err) => match err.kind() {
                std::io::ErrorKind::NotFound => Ok(Download::default()),
                _ => Err(err.into()),
            },
            Ok(file) => Ok(serde_json::from_str::<Download>(file.as_str()).map_err(Error::from)?),
        }
    }

    pub fn ensure<R: Runtime>(resolver: &PathResolver<R>) -> Result<(), Error> {
        let download_dir = resolver.app_config_dir()?;

        if !download_dir.exists() {
            fs::create_dir_all(download_dir)?;
        }

        let download_path = resolver.app_download_file();

        println!("download_path: {:?}", download_path);

        if !download_path.exists() {
            println!("Download file does not exists, creating default one");

            let default_download = Download::default();

            default_download.save(resolver)?;
        }

        Ok(())
    }

    pub fn save<R: Runtime>(&self, resolver: &PathResolver<R>) -> Result<(), Error> {
        let download_path = resolver.app_download_file();

        let json = serde_json::to_string_pretty(self).expect("Failed to serialize downloads");

        fs::write(download_path, json).map_err(Error::from)
    }
}

#[tauri::command]
pub fn get_downloads(window: Window<Wry>) -> Result<Download, Error> {
    Download::get(window.path())
}

#[tauri::command]
pub async fn get_guides(status: Status) -> Result<Vec<Guide>, Error> {
    let res = reqwest::get(format!("https://ganymede-dofus.com/api/guides?status={}", status)).await?;

    let text = res.text().await?;

    let des = &mut serde_json::Deserializer::from_str(text.as_str());

    let guides: Result<Vec<Guide>, _> = serde_path_to_error::deserialize(des);

    match guides {
        Err(err) => {
            println!("Error2: {:?}", err.path().to_string());

            Ok(vec![])
        }
        Ok(guides) => {
            Ok(guides)
        }
    }
}

#[tauri::command]
pub async fn download_guide(guide_id: u32, window: Window<Wry>) -> Result<Download, Error> {
    println!("set_download_guides");

    let res = reqwest::get(format!("https://ganymede-dofus.com/api/guides/{}", guide_id)).await?;
    let text = res.text().await?;
    let des = &mut serde_json::Deserializer::from_str(text.as_str());
    let guide: Result<GuideWithSteps, _> = serde_path_to_error::deserialize(des);

    match guide {
        Ok(guide) => {
            let resolver = window.path();
            let guide_ref = &guide;
            let mut download = Download::get(resolver)?;
            
            match download.downloaded_guides.iter().position(|g| g.id == guide_ref.id) {
                Some(index) => download.downloaded_guides[index] = guide,
                None => download.downloaded_guides.push(guide),
            }

            download.save(resolver)?;

            Ok(download)
        }
        Err(err) => {
            println!("Error: {:?}", err.path().to_string());

            Err(Error::JsonPath(err))
        }
    }
}

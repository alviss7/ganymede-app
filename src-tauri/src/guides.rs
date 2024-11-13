use crate::error::Error;
use crate::tauri_api::GuidesPath;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::{fmt, fs};
use tauri::path::PathResolver;
use tauri::{Manager, Runtime, Window, Wry};
use tauri_plugin_http::reqwest;
use tauri_plugin_shell::ShellExt;

const GANYMEDE_API: &str = "https://ganymede-dofus.com/api/v2";

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
    pub web_text: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Guide {
    pub id: u32,
    pub name: String,
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
    pub description: Option<String>,
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
    pub steps: Vec<Step>,
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct Guides {
    pub guides: Vec<GuideWithSteps>,
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

impl Guides {
    pub fn get_with_path(path_buf: &PathBuf) -> Result<Guides, Error> {
        println!("get_guides in {:?}", path_buf);

        let options = glob::MatchOptions {
            case_sensitive: false,
            require_literal_separator: false,
            require_literal_leading_dot: false,
        };

        let files = glob::glob_with(path_buf.join("**/*.json").to_str().unwrap(), options)
            .expect("Failed to read guides directory for json");

        let mut guides = vec![];

        for entry in files {
            match entry {
                Ok(file) => {
                    println!("file: {:?}", file.file_name().unwrap());

                    let file = fs::read_to_string(file.to_str().unwrap());

                    match file {
                        Err(err) => return Err(err.into()),
                        Ok(file) => {
                            let guide = crate::json::from_str::<GuideWithSteps>(file.as_str())
                                .map_err(Error::from)?;

                            guides.push(guide);
                        }
                    }
                }
                Err(err) => {
                    return Err(crate::error::Error::from(err));
                }
            }
        }

        Ok(Guides { guides })
    }

    pub fn get_with_resolver<R: Runtime>(resolver: &PathResolver<R>) -> Result<Guides, Error> {
        let guides_dir = &resolver.app_guides_dir();

        Guides::get_with_path(guides_dir)
    }

    pub fn ensure<R: Runtime>(resolver: &PathResolver<R>) -> Result<(), Error> {
        let guides_dir = &resolver.app_guides_dir();

        if !guides_dir.exists() {
            fs::create_dir_all(guides_dir)?;
        }

        Ok(())
    }

    pub fn save<R: Runtime>(&self, resolver: &PathResolver<R>) -> Result<(), Error> {
        let guides_dir = &resolver.app_guides_dir();

        for guide in &self.guides {
            let json = serde_json::to_string_pretty(guide).expect("Failed to serialize guide");

            // Create the status directory if it doesn't exist
            let file = guides_dir
                .join(guide.status.to_string())
                .join(format!("{}.json", guide.id));

            if !file.exists() {
                fs::create_dir_all(file.parent().unwrap())?;
            }

            fs::write(file, json).map_err(Error::from)?;
        }

        Ok(())
    }
}

#[tauri::command]
pub fn get_guides(window: Window<Wry>) -> Result<Guides, Error> {
    Guides::get_with_resolver(window.path())
}

#[tauri::command]
pub async fn get_guide_from_server(guide_id: u32) -> Result<GuideWithSteps, Error> {
    println!("get_guide_from_server: {}", guide_id);

    let res = reqwest::get(format!("{}/guides/{}", GANYMEDE_API, guide_id)).await?;
    let text = res.text().await?;
    let guide = crate::json::from_str::<GuideWithSteps>(text.as_str()).map_err(Error::from);

    match guide {
        Err(err) => {
            if let Error::JsonPath(json_error) = &err {
                eprintln!("JsonError: {:?}", json_error.path().to_string());
            }

            Err(err)
        }
        Ok(guide) => Ok(guide),
    }
}

#[tauri::command]
pub async fn get_guides_from_server(status: Status) -> Result<Vec<Guide>, Error> {
    println!("get_guides_from_server");

    let res = reqwest::get(format!("{}/guides?status={}", GANYMEDE_API, status)).await?;

    let text = res.text().await?;

    let guides = crate::json::from_str::<Vec<Guide>>(text.as_str()).map_err(Error::from);

    match guides {
        Err(err) => {
            if let Error::JsonPath(json_error) = &err {
                eprintln!("JsonError: {:?}", json_error.path().to_string());
            } else {
                eprintln!("Error: {:?}", err);
            }

            Ok(vec![])
        }
        Ok(guides) => Ok(guides),
    }
}

#[tauri::command]
pub async fn download_guide_from_server(
    guide_id: u32,
    window: Window<Wry>,
) -> Result<Guides, Error> {
    println!("download_guide_from_server");

    let guide = get_guide_from_server(guide_id).await;

    match guide {
        Ok(guide) => {
            let resolver = window.path();
            let guide_ref = &guide;
            let mut guides = Guides::get_with_resolver(resolver)?;

            // Update the guide file if it exists
            match guides.guides.iter().position(|g| g.id == guide_ref.id) {
                Some(index) => guides.guides[index] = guide,
                None => guides.guides.push(guide),
            }

            guides.save(resolver)?;

            Ok(guides)
        }
        Err(err) => {
            if let Error::JsonPath(json_error) = &err {
                eprintln!("JsonError: {:?}", json_error.path().to_string());
            }

            Err(err)
        }
    }
}

#[tauri::command]
pub fn open_guides_folder(window: Window<Wry>) -> Result<(), tauri_plugin_shell::Error> {
    let resolver = window.path();
    let guides_dir = resolver.app_guides_dir();

    window
        .app_handle()
        .shell()
        .open(guides_dir.to_str().unwrap().to_string(), None)
}

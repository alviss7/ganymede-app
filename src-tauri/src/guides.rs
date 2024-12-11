use crate::api::GANYMEDE_API_V2;
use crate::tauri_api_ext::GuidesPathExt;
use log::info;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::{fmt, fs, vec};
use tauri::ipc::InvokeError;
use tauri::{AppHandle, Manager, Window, Wry};
use tauri_plugin_http::reqwest;
use tauri_plugin_shell::ShellExt;

pub const DEFAULT_GUIDE_ID: u32 = 1074;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("cannot parse glob pattern: {0}")]
    Pattern(glob::PatternError),
    #[error("cannot read the guides directory glob: {0}")]
    ReadGuidesDirGlob(glob::GlobError),
    #[error("cannot read a guide file: {0}")]
    ReadGuideFile(std::io::Error),
    #[error("malformed guide: {0}")]
    GuideMalformed(crate::json::Error),
    #[error("cannot serialize guide: {0}")]
    SerializeGuide(serde_json::Error),
    #[error("cannot create the guides directory: {0}")]
    CreateGuidesDir(std::io::Error),
    #[error("cannot write a guide file: {0}")]
    WriteGuideFile(std::io::Error),
    #[error("cannot request a guide from server: {0}")]
    RequestGuide(reqwest::Error),
    #[error("cannot get the content of a guide request: {0}")]
    RequestGuideContent(reqwest::Error),
    #[error("cannot request guides from server: {0}")]
    RequestGuides(reqwest::Error),
    #[error("cannot get the content of a guides request: {0}")]
    RequestGuidesContent(reqwest::Error),
    #[error("malformed guide with steps: {0}")]
    GuideWithStepsMalformed(crate::json::Error),
    #[error("malformed guides: {0}")]
    GuidesMalformed(crate::json::Error),
    #[error("cannot read the guides directory: {0}")]
    ReadGuidesDir(std::io::Error),
}

impl Into<InvokeError> for Error {
    fn into(self) -> InvokeError {
        use Error::*;

        InvokeError::from(match self {
            Pattern(err) => format!("Pattern({})", err.to_string()),
            ReadGuidesDirGlob(err) => format!("ReadGuidesDirGlob({})", err.to_string()),
            ReadGuideFile(err) => format!("ReadGuideFile({})", err.to_string()),
            GuideMalformed(err) => format!("GuideMalformed({})", err.to_string()),
            SerializeGuide(err) => format!("SerializeGuide({})", err.to_string()),
            CreateGuidesDir(err) => format!("CreateGuidesDir({})", err.to_string()),
            WriteGuideFile(err) => format!("WriteGuideFile({})", err.to_string()),
            RequestGuide(err) => format!("RequestGuide({})", err.to_string()),
            RequestGuideContent(err) => format!("RequestGuideContent({})", err.to_string()),
            RequestGuides(err) => format!("RequestGuides({})", err.to_string()),
            RequestGuidesContent(err) => format!("RequestGuidesContent({})", err.to_string()),
            GuideWithStepsMalformed(err) => format!("GuideWithStepsMalformed({})", err.to_string()),
            GuidesMalformed(err) => format!("GuidesMalformed({})", err.to_string()),
            ReadGuidesDir(err) => format!("ReadGuidesDir({})", err.to_string()),
        })
    }
}

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
    pub map: Option<String>,
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
    #[serde(skip_deserializing, serialize_with = "crate::json::serialize_path")]
    pub folder: Option<PathBuf>,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct Guides {
    pub guides: Vec<GuideWithSteps>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Folder {
    pub name: String,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum GuidesOrFolder {
    Guide(GuideWithSteps),
    Folder(Folder),
}

impl GuidesOrFolder {
    pub fn from_handle(
        app: &AppHandle,
        folder: Option<String>,
    ) -> Result<Vec<GuidesOrFolder>, Error> {
        let mut guide_folder = app.path().app_guides_dir();

        if let Some(folder) = folder {
            guide_folder = guide_folder.join(folder);
        }

        println!("[Guides] get_guides_or_folder in {:?}", guide_folder);

        let mut result = vec![];

        for entry in fs::read_dir(guide_folder).map_err(Error::ReadGuidesDir)? {
            let entry = entry.map_err(Error::ReadGuidesDir)?;
            let path = entry.path();
            let file_name = path.file_name().unwrap().to_str().unwrap().to_string();

            if path.is_dir() {
                result.push(GuidesOrFolder::Folder(Folder { name: file_name }));
            } else if path.is_file() {
                let extension = path.extension();

                if let Some(ext) = extension {
                    if ext == "json" {
                        let file = fs::read_to_string(&path).map_err(Error::ReadGuideFile)?;
                        let mut guide = crate::json::from_str::<GuideWithSteps>(file.as_str())
                            .map_err(Error::GuideMalformed)?;

                        guide.folder = Some(if path.is_dir() {
                            path
                        } else {
                            path.parent().unwrap().to_path_buf()
                        });

                        result.push(GuidesOrFolder::Guide(guide));
                    }
                }
            }
        }

        Ok(result)
    }
}

impl fmt::Display for Status {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        use Status::*;

        let status_str = match self {
            Draft => "draft",
            Public => "public",
            Private => "private",
            Certified => "certified",
            Gp => "gp",
        };
        write!(formatter, "{}", status_str)
    }
}

impl Guides {
    fn from_path(path_buf: &PathBuf) -> Result<Guides, Error> {
        info!("[Guides] get_guides in {:?}", path_buf);

        let options = glob::MatchOptions {
            case_sensitive: false,
            require_literal_separator: false,
            require_literal_leading_dot: false,
        };

        let files = glob::glob_with(path_buf.join("**/*.json").to_str().unwrap(), options)
            .map_err(Error::Pattern)?;

        let mut guides = vec![];

        for entry in files {
            let file_path = entry.map_err(Error::ReadGuidesDirGlob)?;

            let file =
                fs::read_to_string(file_path.to_str().unwrap()).map_err(Error::ReadGuideFile)?;

            let mut guide = crate::json::from_str::<GuideWithSteps>(file.as_str())
                .map_err(Error::GuideMalformed)?;

            guide.folder = Some(if file_path.is_dir() {
                file_path
            } else {
                file_path.parent().unwrap().to_path_buf()
            });

            if guides.iter().any(|g: &GuideWithSteps| g.id == guide.id) {
                continue;
            }

            guides.push(guide);
        }

        Ok(Guides { guides })
    }

    fn from_handle(app: &AppHandle) -> Result<Guides, Error> {
        let guides_dir = &app.path().app_guides_dir();

        Guides::from_path(guides_dir)
    }

    fn write(&self, app: &AppHandle) -> Result<(), Error> {
        let guides_dir = &app.path().app_guides_dir();

        for guide in &self.guides {
            let json = serde_json::to_string_pretty(guide).map_err(Error::SerializeGuide)?;

            if !guides_dir.exists() {
                fs::create_dir_all(guides_dir).map_err(Error::CreateGuidesDir)?;
            }

            let file = guide
                .folder
                .as_ref()
                .unwrap_or(guides_dir)
                .join(format!("{}.json", guide.id));

            println!("Writing guide to {:?}", file);

            fs::write(file.as_path(), json).map_err(Error::WriteGuideFile)?;
        }

        Ok(())
    }

    fn add_or_replace(&mut self, app: &AppHandle, guide: GuideWithSteps) -> Result<(), Error> {
        let guide_ref = &guide;

        // Update the guide file if it exists
        match self.guides.iter().position(|g| g.id == guide_ref.id) {
            Some(index) => self.guides[index] = guide,
            None => self.guides.push(guide),
        }

        self.write(app)?;

        Ok(())
    }
}

pub fn ensure(app: &AppHandle) -> Result<(), Error> {
    let guides_dir = &app.path().app_guides_dir();

    info!("Log dir: {:?}", &app.path().app_log_dir().unwrap());

    if !guides_dir.exists() {
        fs::create_dir_all(guides_dir).map_err(Error::CreateGuidesDir)?;
    }

    Ok(())
}

pub async fn download_default_guide(app: &AppHandle) -> Result<Guides, Error> {
    download_guide_by_id(app, DEFAULT_GUIDE_ID, "".into()).await
}

#[tauri::command]
pub fn get_flat_guides(app: AppHandle) -> Result<Vec<GuideWithSteps>, Error> {
    let guides = Guides::from_handle(&app)?;

    Ok(guides.guides.into_iter().collect())
}

#[tauri::command]
pub fn get_guides(app: AppHandle, folder: Option<String>) -> Result<Vec<GuidesOrFolder>, Error> {
    GuidesOrFolder::from_handle(&app, folder)
}

#[tauri::command]
pub async fn get_guide_from_server(guide_id: u32) -> Result<GuideWithSteps, Error> {
    info!("[Guides] get_guide_from_server: {}", guide_id);

    let res = reqwest::get(format!("{}/guides/{}", GANYMEDE_API_V2, guide_id))
        .await
        .map_err(Error::RequestGuide)?;
    let text = res.text().await.map_err(Error::RequestGuideContent)?;

    let mut guide = crate::json::from_str::<GuideWithSteps>(text.as_str())
        .map_err(Error::GuideWithStepsMalformed)?;

    guide.folder = None;

    Ok(guide)
}

#[tauri::command]
pub async fn get_guides_from_server(status: Status) -> Result<Vec<Guide>, Error> {
    info!("[Guides] get_guides_from_server");

    let res = reqwest::get(format!("{}/guides?status={}", GANYMEDE_API_V2, status))
        .await
        .map_err(Error::RequestGuides)?;

    let text = res.text().await.map_err(Error::RequestGuidesContent)?;

    crate::json::from_str::<Vec<Guide>>(text.as_str()).map_err(Error::GuidesMalformed)
}

#[tauri::command]
pub async fn download_guide_from_server(
    guide_id: u32,
    folder: String,
    app: AppHandle,
) -> Result<Guides, Error> {
    info!("[Guides] download_guide_from_server");

    Ok(download_guide_by_id(&app, guide_id, folder).await?)
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

async fn download_guide_by_id(
    app: &AppHandle,
    guide_id: u32,
    folder: String,
) -> Result<Guides, Error> {
    let mut guide = get_guide_from_server(guide_id).await?;

    guide.folder = Some(app.path().app_guides_dir().join(folder.clone()));

    println!("folder {:?} + {}", guide.folder, folder);

    let mut guides = Guides::from_handle(app)?;
    let guides_ref = &mut guides;

    // implement add_or_replace, this fn should add the guide if it doesn't exist, or replace it if it does
    // it should write the file guide in the correct folder ignoring status
    guides_ref.add_or_replace(app, guide)?;

    Ok(guides)
}

// implement a command to know if a guide is downloaded, with glob pattern, so in front we can display the button and know where it is
// warn if the guide is in two places or more

use crate::error::Error;
use crate::tauri_api::ConfPath;
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::path::PathResolver;
use tauri::{Manager, Runtime, Window, Wry};

#[derive(Serialize, Deserialize, Clone)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub progresses: Vec<Progress>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Progress {
    pub id: u32, // guide id
    pub step: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Lang {
    En,
    Fr,
    Es,
    Pt,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Conf {
    pub auto_travel_copy: bool,
    pub show_done_guides: bool,
    #[serde(default)]
    pub lang: Lang,
    pub profiles: Vec<Profile>,
    pub profile_in_use: String,
}

impl Conf {
    // Check when serde_json error, display a reset button?
    pub fn get<R: Runtime>(resolver: &PathResolver<R>) -> Result<Conf, Error> {
        let conf_path = resolver.app_conf_file();

        let file = fs::read_to_string(conf_path);

        // if conf file does not exist, return default conf, otherwise parse the file content
        match file {
            Err(err) => match err.kind() {
                std::io::ErrorKind::NotFound => Ok(Conf::default()),
                _ => Err(err.into()),
            },
            Ok(file) => Ok(crate::json::from_str::<Conf>(file.as_str()).map_err(Error::from)?),
        }
    }

    pub fn ensure<R: Runtime>(resolver: &PathResolver<R>) -> Result<(), Error> {
        let conf_dir = resolver.app_config_dir()?;

        if !conf_dir.exists() {
            fs::create_dir_all(conf_dir)?;
        }

        let conf_path = resolver.app_conf_file();

        println!("conf_path: {:?}", conf_path);

        if !conf_path.exists() {
            println!("Conf file does not exists, creating default one");

            let default_conf = Conf::default();

            default_conf.save(resolver)?;
        }

        Ok(())
    }

    pub fn save<R: Runtime>(&self, resolver: &PathResolver<R>) -> Result<(), Error> {
        let conf_path = resolver.app_conf_file();

        let json = serde_json::to_string_pretty(self).expect("Failed to serialize conf");

        fs::write(conf_path, json).map_err(Error::from)
    }
}

impl Default for Lang {
    fn default() -> Self {
        Lang::Fr
    }
}

impl Default for Conf {
    fn default() -> Self {
        let default_profile = Profile::default();
        let default_profile_id = default_profile.id.clone();

        Conf {
            auto_travel_copy: true,
            show_done_guides: true,
            lang: Lang::default(),
            profiles: vec![default_profile],
            profile_in_use: default_profile_id,
        }
    }
}

impl Default for Profile {
    fn default() -> Self {
        Profile {
            id: uuid::Uuid::new_v4().to_string(),
            name: "Player".to_string(),
            progresses: vec![],
        }
    }
}

#[tauri::command]
pub fn get_conf(window: Window<Wry>) -> Result<Conf, Error> {
    Conf::get(window.path())
}

#[tauri::command]
pub fn set_conf(conf: Conf, window: Window<Wry>) -> Result<(), Error> {
    let resolver = window.path();

    conf.save(resolver)
}

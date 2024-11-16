use crate::error::Error;
use crate::tauri_api::ConfPath;
use serde::{Deserialize, Serialize};
use std::borrow::BorrowMut;
use std::collections::HashMap;
use std::fs;
use tauri::path::PathResolver;
use tauri::{Manager, Runtime, Window, Wry};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub progresses: Vec<Progress>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Step {
    pub checkboxes: Vec<usize>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Progress {
    pub id: u32, // guide id
    pub current_step: usize,
    pub steps: HashMap<usize, Step>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Lang {
    En,
    Fr,
    Es,
    Pt,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FontSize {
    Small,
    Base,
    Large,
    Extra,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AutoPilot {
    pub name: String,
    pub position: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Note {
    pub name: String,
    pub text: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Conf {
    pub auto_travel_copy: bool,
    pub show_done_guides: bool,
    #[serde(default)]
    pub lang: Lang,
    #[serde(default)]
    pub font_size: FontSize,
    pub profiles: Vec<Profile>,
    pub profile_in_use: String,
    pub auto_pilots: Vec<AutoPilot>,
    pub notes: Vec<Note>,
    pub opacity: f32,
}

impl Progress {
    pub fn add_or_update_step(&mut self, step: Step, step_index: usize) {
        match self.steps.get(&step_index) {
            Some(s) => {
                self.steps.insert(step_index, s.clone());
            }
            None => {
                self.steps.insert(step_index, step.clone());
            }
        }
    }
}

impl Profile {
    pub fn get_progress_mut(&mut self, guide_id: u32) -> Option<&mut Progress> {
        self.progresses.iter_mut().find(|p| p.id == guide_id)
    }
}

impl Step {
    pub fn toggle_checkbox(&mut self, checkbox_index: usize) {
        match self.checkboxes.iter().position(|&i| i == checkbox_index) {
            Some(index) => {
                self.checkboxes.remove(index);
            }
            None => {
                self.checkboxes.push(checkbox_index);
            }
        }
    }
}

impl Conf {
    // Check when serde_json error, display a reset button?
    pub fn get_with_resolver<R: Runtime>(resolver: &PathResolver<R>) -> Result<Conf, Error> {
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

            let default_conf = &mut Conf::default();

            default_conf.save(resolver)?;
        }

        Ok(())
    }

    pub fn save<R: Runtime>(&mut self, resolver: &PathResolver<R>) -> Result<(), Error> {
        let conf_path = resolver.app_conf_file();

        self.normalize();

        let json = serde_json::to_string_pretty(self).expect("Failed to serialize conf");

        fs::write(conf_path, json).map_err(Error::from)
    }

    pub fn get_profile_in_use_mut(&mut self) -> Option<&mut Profile> {
        self.profiles
            .iter_mut()
            .find(|p| p.id == self.profile_in_use)
    }

    pub fn normalize(&mut self) {
        self.opacity = self.opacity.clamp(0.0, 0.94);
    }
}

impl Default for Step {
    fn default() -> Self {
        Step { checkboxes: vec![] }
    }
}

impl Default for Lang {
    fn default() -> Self {
        Lang::Fr
    }
}

impl Default for FontSize {
    fn default() -> Self {
        FontSize::Base
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
            font_size: FontSize::default(),
            profiles: vec![default_profile],
            profile_in_use: default_profile_id,
            auto_pilots: vec![],
            notes: vec![],
            opacity: 0.93,
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
    Conf::get_with_resolver(window.path())
}

#[tauri::command]
pub fn set_conf(conf: Conf, window: Window<Wry>) -> Result<(), Error> {
    let resolver = window.path();

    conf.clone().borrow_mut().save(resolver)
}

#[tauri::command]
pub fn toggle_guide_checkbox(
    window: Window<Wry>,
    guide_id: u32,
    step_index: usize,
    checkbox_index: usize,
) -> Option<usize> {
    let resolver = window.path();
    let conf = &mut Conf::get_with_resolver(resolver).expect("Cannot find conf with resolver");
    let profile = conf.get_profile_in_use_mut();

    if profile.is_none() {
        return None;
    }

    let profile = profile.unwrap();
    let profile_name = profile.name.clone();
    let profile_id = profile.id.clone();

    let progress = profile.get_progress_mut(guide_id);
    let progress = progress.expect(
        format!(
            "Cannot find progress with guide_id in {} profile {}_#{}",
            guide_id, profile_name, profile_id
        )
        .as_str(),
    );

    let step = match progress.steps.get_mut(&step_index) {
        Some(step) => step,
        None => &mut Step::default(),
    };

    step.toggle_checkbox(checkbox_index);

    let step = step.clone();

    progress.add_or_update_step(step, step_index);

    conf.save(resolver).expect("Cannot save conf");

    Some(checkbox_index)
}

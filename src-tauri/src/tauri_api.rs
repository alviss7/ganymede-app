use std::path::PathBuf;
use tauri::path::PathResolver;
use tauri::Runtime;

pub trait ConfPath {
    fn app_conf_file(&self) -> PathBuf;
}

pub trait GuidesPath {
    fn app_guides_dir(&self) -> PathBuf;
}

impl<R: Runtime> ConfPath for PathResolver<R> {
    fn app_conf_file(&self) -> PathBuf {
        let path = self.app_config_dir().unwrap();

        path.join("conf.json")
    }
}

impl<R: Runtime> GuidesPath for PathResolver<R> {
    fn app_guides_dir(&self) -> PathBuf {
        let path = self.app_config_dir().unwrap();

        path.join("guides")
    }
}

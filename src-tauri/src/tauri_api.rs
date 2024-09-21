use std::path::PathBuf;
use tauri::path::PathResolver;
use tauri::Runtime;

pub trait ConfPath {
    fn app_conf_file(&self) -> PathBuf;
}

pub trait DownloadPath {
    fn app_download_file(&self) -> PathBuf;
}

impl<R: Runtime> ConfPath for PathResolver<R> {
    fn app_conf_file(&self) -> PathBuf {
        let mut path = self.app_config_dir().unwrap();

        path.push("conf.json");

        path
    }
}

impl<R: Runtime> DownloadPath for PathResolver<R> {
    fn app_download_file(&self) -> PathBuf {
        let mut path = self.app_config_dir().unwrap();

        path.push("download.json");

        path
    }
}

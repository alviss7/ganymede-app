#[derive(Debug)]
pub enum Error {
    String(String),
    Io(std::io::Error),
    Json(serde_json::Error),
    Tauri(tauri::Error),
    Invoke(tauri::ipc::InvokeError),
    Http(tauri_plugin_http::reqwest::Error),
    JsonPath(serde_path_to_error::Error<serde_json::Error>),
    Glob(glob::GlobError),
    EarlyReturn,
}

impl From<String> for Error {
    fn from(err: String) -> Self {
        Error::String(err)
    }
}

impl From<std::io::Error> for Error {
    fn from(err: std::io::Error) -> Self {
        Error::Io(err)
    }
}

impl From<serde_json::Error> for Error {
    fn from(err: serde_json::Error) -> Self {
        Error::Json(err)
    }
}

impl From<tauri::Error> for Error {
    fn from(err: tauri::Error) -> Self {
        Error::Tauri(err)
    }
}

impl From<tauri::ipc::InvokeError> for Error {
    fn from(err: tauri::ipc::InvokeError) -> Self {
        Error::Invoke(err)
    }
}

impl From<tauri_plugin_http::reqwest::Error> for Error {
    fn from(err: tauri_plugin_http::reqwest::Error) -> Self {
        Error::Http(err)
    }
}

impl From<serde_path_to_error::Error<serde_json::Error>> for Error {
    fn from(err: serde_path_to_error::Error<serde_json::Error>) -> Self {
        Error::JsonPath(err)
    }
}

impl From<glob::GlobError> for Error {
    fn from(err: glob::GlobError) -> Self {
        Error::Glob(err)
    }
}

impl Into<tauri::ipc::InvokeError> for Error {
    fn into(self) -> tauri::ipc::InvokeError {
        eprintln!("Error: {:?}", self);
        match self {
            Error::String(err) => tauri::ipc::InvokeError::from(err),
            Error::Invoke(err) => err,
            Error::Json(err) => tauri::ipc::InvokeError::from(err.to_string()),
            Error::Io(err) => tauri::ipc::InvokeError::from(err.to_string()),
            Error::Tauri(err) => tauri::ipc::InvokeError::from(err.to_string()),
            Error::Http(err) => tauri::ipc::InvokeError::from(err.to_string()),
            Error::JsonPath(err) => tauri::ipc::InvokeError::from(err.to_string()),
            Error::Glob(err) => tauri::ipc::InvokeError::from(err.to_string()),
            Error::EarlyReturn => tauri::ipc::InvokeError::from("Early return".to_string()),
        }
    }
}

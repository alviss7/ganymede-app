#[derive(Debug)]
pub enum Error {
    Io(std::io::Error),
    Json(serde_json::Error),
    Tauri(tauri::Error),
    Invoke(tauri::ipc::InvokeError),
    Http(tauri_plugin_http::reqwest::Error),
    JsonPath(serde_path_to_error::Error<serde_json::Error>),
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

impl Into<tauri::ipc::InvokeError> for Error {
    fn into(self) -> tauri::ipc::InvokeError {
        println!("Error: {:?}", self);
        match self {
            Error::Invoke(err) => err,
            Error::Json(err) => tauri::ipc::InvokeError::from(err.to_string()),
            Error::Io(err) => tauri::ipc::InvokeError::from(err.to_string()),
            Error::Tauri(err) => tauri::ipc::InvokeError::from(err.to_string()),
            Error::Http(err) => tauri::ipc::InvokeError::from(err.to_string()),
            Error::JsonPath(err) => tauri::ipc::InvokeError::from(err.to_string()),
        }
    }
}

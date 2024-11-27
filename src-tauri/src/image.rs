use tauri_plugin_http::reqwest;

pub enum Error {
    RequestImage(reqwest::Error),
    ConvertToBytes(reqwest::Error),
}

impl Into<tauri::ipc::InvokeError> for Error {
    fn into(self) -> tauri::ipc::InvokeError {
        match self {
            Error::RequestImage(err) => {
                tauri::ipc::InvokeError::from(format!("RequestImage({})", err.to_string()))
            }
            Error::ConvertToBytes(err) => {
                tauri::ipc::InvokeError::from(format!("ConvertToBytes({})", err.to_string()))
            }
        }
    }
}

#[tauri::command]
pub async fn fetch_image(url: String) -> Result<Vec<u8>, Error> {
    reqwest::get(url)
        .await
        .map_err(Error::RequestImage)?
        .bytes()
        .await
        .map(|bytes| bytes.to_vec())
        .map_err(Error::ConvertToBytes)
}

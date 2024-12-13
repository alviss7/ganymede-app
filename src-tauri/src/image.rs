use serde::Serialize;
use tauri_plugin_http::reqwest;

#[derive(Debug, Serialize, thiserror::Error)]
pub enum Error {
    #[error("RequestImage({0})")]
    RequestImage(String),
    #[error("ConvertToBytes({0})")]
    ConvertToBytes(String),
}

#[taurpc::procedures(path = "image", export_to = "../src/ipc/bindings.ts")]
pub trait ImageApi {
    #[taurpc(alias = "fetchImage")]
    async fn fetch_image(url: String) -> Result<Vec<u8>, Error>;
}

#[derive(Clone)]
pub struct ImageApiImpl;

#[taurpc::resolvers]
impl ImageApi for ImageApiImpl {
    async fn fetch_image(self, url: String) -> Result<Vec<u8>, Error> {
        reqwest::get(url)
            .await
            .map_err(|err| Error::RequestImage(err.to_string()))?
            .bytes()
            .await
            .map(|bytes| bytes.to_vec())
            .map_err(|err| Error::ConvertToBytes(err.to_string()))
    }
}

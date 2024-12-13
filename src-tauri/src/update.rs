use crate::event::Event;
use log::info;
use tauri::{AppHandle, Emitter};
use tauri_plugin_updater::UpdaterExt;

#[taurpc::procedures(path = "update", export_to = "../src/ipc/bindings.ts")]
pub trait UpdateApi {
    #[taurpc(alias = "startUpdate")]
    async fn start_update(app_handle: AppHandle) -> tauri_plugin_updater::Result<()>;
}

#[derive(Clone)]
pub struct UpdateApiImpl;

#[taurpc::resolvers]
impl UpdateApi for UpdateApiImpl {
    async fn start_update(self, app: AppHandle) -> tauri_plugin_updater::Result<()> {
        if let Some(update) = app.updater()?.check().await? {
            app.emit(Event::UpdateStarted.into(), 0)
                .expect("[Update] failed to emit update in progress event");

            let mut downloaded = 0;

            // alternatively we could also call update.download() and update.install() separately
            update
                .download_and_install(
                    |chunk_length, content_length| {
                        downloaded += chunk_length;
                        app.emit(Event::UpdateInProgress.into(), (downloaded, content_length))
                            .expect("[Update] failed to emit update in progress event");
                        info!("[Update] downloaded {downloaded} from {content_length:?}");
                    },
                    || {
                        app.emit(Event::UpdateFinished.into(), 0)
                            .expect("[Update] failed to emit update finished event");
                        info!("[Update] download finished");
                    },
                )
                .await?;

            info!("[Update] update installed");

            // not required, but we can restart the app after the update
            app.restart();
        }

        Ok(())
    }
}

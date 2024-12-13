use crate::event::Event;
use log::{debug, info};
use tauri::{AppHandle, Emitter};
use tauri_plugin_sentry::sentry;
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
        debug!("[Update] starting update check");

        sentry::add_breadcrumb(sentry::Breadcrumb {
            ty: "info".into(),
            category: Some("update".into()),
            message: Some("starting update check".to_string()),
            ..Default::default()
        });

        if let Some(update) = app.updater()?.check().await? {
            debug!("[Update] update found");

            sentry::add_breadcrumb(sentry::Breadcrumb {
                ty: "info".into(),
                category: Some("update".into()),
                message: Some("update found".to_string()),
                ..Default::default()
            });

            app.emit(Event::UpdateStarted.into(), 0).unwrap();

            let mut downloaded = 0;

            // alternatively we could also call update.download() and update.install() separately
            let bytes = update
                .download(
                    |chunk_length, content_length| {
                        downloaded += chunk_length;
                        app.emit(Event::UpdateInProgress.into(), (downloaded, content_length))
                            .unwrap();
                        info!("[Update] downloaded {downloaded} from {content_length:?}");
                    },
                    || {
                        sentry::add_breadcrumb(sentry::Breadcrumb {
                            ty: "info".into(),
                            category: Some("update".into()),
                            message: Some("update downloaded".to_string()),
                            ..Default::default()
                        });
                        app.emit(Event::UpdateFinished.into(), 0).unwrap();
                        info!("[Update] download finished");
                    },
                )
                .await
                .unwrap();

            debug!("[Update] downloaded");

            sentry::add_breadcrumb(sentry::Breadcrumb {
                ty: "info".into(),
                category: Some("update".into()),
                message: Some("installing update".to_string()),
                ..Default::default()
            });

            update.install(bytes).unwrap();

            info!("[Update] update installed");

            sentry::add_breadcrumb(sentry::Breadcrumb {
                ty: "info".into(),
                category: Some("update".into()),
                message: Some("restarting the application".to_string()),
                ..Default::default()
            });

            // not required, but we can restart the app after the update
            app.restart();
        }

        Ok(())
    }
}

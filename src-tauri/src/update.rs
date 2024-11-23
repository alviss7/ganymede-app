use crate::event::Event;
use tauri::{AppHandle, Emitter};
use tauri_plugin_updater::UpdaterExt;

#[tauri::command]
pub async fn start_update(app: AppHandle) -> tauri_plugin_updater::Result<()> {
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
                    println!("[Update] downloaded {downloaded} from {content_length:?}");
                },
                || {
                    app.emit(Event::UpdateFinished.into(), 0)
                        .expect("[Update] failed to emit update finished event");
                    println!("[Update] download finished");
                },
            )
            .await?;

        println!("[Update] update installed");

        // not required, but we can restart the app after the update
        app.restart();
    }

    Ok(())
}

use crate::almanax::get_almanax;
use crate::api::is_app_version_old;
use crate::conf::{get_conf, set_conf, toggle_guide_checkbox, Conf};
use crate::guides::{
    download_guide_from_server, get_guide_from_server, get_guides, get_guides_from_server,
    open_guides_folder, Guides,
};
use crate::id::new_id;
use crate::shortcut::handle_shortcuts;
use crate::update::start_update;
use tauri::{Manager, Wry};
use tauri_plugin_http::reqwest;
use tauri_plugin_sentry::{minidump, sentry};
use tauri_plugin_shell::ShellExt;

mod almanax;
mod api;
mod conf;
mod error;
mod event;
mod guides;
mod id;
mod item;
mod json;
mod quest;
mod shortcut;
mod tauri_api;
mod update;

#[tauri::command]
async fn open_in_shell(
    app: tauri::AppHandle<Wry>,
    href: String,
) -> Result<(), tauri_plugin_shell::Error> {
    app.shell().open(href, None)
}

#[tauri::command]
async fn fetch_image(url: String) -> Result<Vec<u8>, String> {
    reqwest::get(url)
        .await
        .map_err(|err| err.to_string())?
        .bytes()
        .await
        .map(|bytes| bytes.to_vec())
        .map_err(|err| err.to_string())
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let sentry_client = sentry::init((
        env!("SENTRY_DSN"),
        sentry::ClientOptions {
            release: sentry::release_name!(),
            ..Default::default()
        },
    ));

    let _guard = minidump::init(&sentry_client);

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sentry::init_with_no_injection(&sentry_client))
        .setup(|app| {
            match Conf::ensure(&app.path()) {
                Err(err) => {
                    eprintln!("lib://failed to ensure conf: {:?}", err);
                }
                Ok(_) => {}
            }

            match Guides::ensure(&app.path()) {
                Err(err) => {
                    eprintln!("lib://failed to ensure download: {:?}", err);
                }
                Ok(_) => {}
            }

            #[cfg(not(debug_assertions))]
            {
                let version = app.package_info().version.to_string();

                tauri::async_runtime::spawn(async {
                    let res = api::increment_app_download_count(version).await;

                    if let Err(err) = &res {
                        eprintln!("lib://{:?}", err);
                    } else {
                        println!("lib://app download count incremented");
                    }
                });
            }

            #[cfg(desktop)]
            {
                handle_shortcuts(app)?;
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_conf,
            set_conf,
            new_id,
            get_guides_from_server,
            get_guides,
            download_guide_from_server,
            get_almanax,
            open_guides_folder,
            toggle_guide_checkbox,
            open_in_shell,
            fetch_image,
            get_guide_from_server,
            is_app_version_old,
            start_update
        ])
        .run(tauri::generate_context!())
        .expect("lib://error while running tauri application");
}

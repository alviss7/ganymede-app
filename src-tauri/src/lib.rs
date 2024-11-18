use crate::almanax::get_almanax;
use crate::api::is_app_version_old;
use crate::conf::{get_conf, set_conf, toggle_guide_checkbox, Conf};
use crate::guides::{
    download_guide_from_server, get_guide_from_server, get_guides, get_guides_from_server,
    open_guides_folder, Guides,
};
use crate::id::new_id;
use tauri::{Manager, Wry};
use tauri_plugin_http::reqwest;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_updater::UpdaterExt;

mod almanax;
mod api;
mod conf;
mod error;
mod guides;
mod id;
mod item;
mod json;
mod quest;
mod tauri_api;

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
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            match Conf::ensure(&app.path()) {
                Err(err) => {
                    eprintln!("Failed to ensure conf: {:?}", err);
                }
                Ok(_) => {}
            }

            match Guides::ensure(&app.path()) {
                Err(err) => {
                    eprintln!("Failed to ensure download: {:?}", err);
                }
                Ok(_) => {}
            }

            #[cfg(not(debug_assertions))]
            {
                let version = app.package_info().version.to_string();

                tauri::async_runtime::spawn(async {
                    let res = api::increment_app_download_count(version).await;

                    if let Err(err) = &res {
                        eprintln!("{:?}", err);
                    } else {
                        println!("App download count incremented");
                    }
                });
            }

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                update(handle).await.unwrap();
            });

            #[cfg(desktop)]
            {
                use std::str::FromStr;
                use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

                let ctrl_shift_d_shortcut = Shortcut::from_str("CommandOrControl+Shift+D").unwrap();

                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |app, shortcut, event| {
                            if shortcut == &ctrl_shift_d_shortcut
                                && event.state() == ShortcutState::Pressed
                            {
                                Conf::default()
                                    .save(app.path())
                                    .expect("Failed to reset conf");
                                println!("Conf reset triggered");

                                let mut webview = app
                                    .get_webview_window("main")
                                    .expect("Failed to get webview window");

                                let url = webview.url().unwrap();

                                webview.navigate(url).expect("Failed to reload webview");
                            }
                        })
                        .build(),
                )?;

                app.global_shortcut().register(ctrl_shift_d_shortcut)?;
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
            is_app_version_old
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        let mut downloaded = 0;

        // alternatively we could also call update.download() and update.install() separately
        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    println!("downloaded {downloaded} from {content_length:?}");
                },
                || {
                    println!("download finished");
                },
            )
            .await?;

        println!("update installed");
        app.restart();
    }

    Ok(())
}

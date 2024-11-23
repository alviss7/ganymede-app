use std::str::FromStr;
use tauri::{App, Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

use crate::conf::Conf;
use crate::event::Event;

pub fn handle_shortcuts(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    let reset_conf_shortcut = Shortcut::from_str("CommandOrControl+Shift+P").unwrap();
    let go_next_step_shortcut = Shortcut::from_str("CommandOrControl+Shift+E").unwrap();
    let go_previous_step_shortcut = Shortcut::from_str("CommandOrControl+Shift+A").unwrap();

    app.handle().plugin(
        tauri_plugin_global_shortcut::Builder::new()
            .with_handler(move |app, shortcut, event| {
                let state = event.state();

                match state {
                    ShortcutState::Pressed => {
                        if shortcut == &reset_conf_shortcut {
                            Conf::default()
                                .save(app.path())
                                .expect("[Shortcut] failed to reset conf");
                            println!("[Shortcut] conf reset triggered");

                            let mut webview = app
                                .get_webview_window("main")
                                .expect("[Shortcut] failed to get webview window");

                            let url = webview.url().unwrap();

                            webview
                                .navigate(url)
                                .expect("[Shortcut] failed to reload webview");
                        }

                        if shortcut == &go_next_step_shortcut
                            || shortcut == &go_previous_step_shortcut
                        {
                            println!("Shortcut {} pressed", shortcut.to_string());

                            if shortcut == &go_next_step_shortcut {
                                app.emit(Event::GoToNextGuideStep.into(), 0)
                                    .expect("[Shortcut] failed to emit next event");
                            } else if shortcut == &go_previous_step_shortcut {
                                app.emit(Event::GoToPreviousGuideStep.into(), 0)
                                    .expect("[Shortcut] failed to emit previous event");
                            }
                        }
                    }
                    _ => {}
                }
            })
            .build(),
    )?;

    app.global_shortcut().register(reset_conf_shortcut)?;
    app.global_shortcut().register(go_next_step_shortcut)?;
    app.global_shortcut().register(go_previous_step_shortcut)?;

    Ok(())
}

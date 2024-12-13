use std::env;

fn is_dev() -> bool {
    env::var("DEP_TAURI_DEV").unwrap_or("true".into()) == "true"
}

// creates a cfg alias if `has_feature` is true.
// `alias` must be a snake case string.
fn cfg_alias(alias: &str, has_feature: bool) {
    println!("cargo:rustc-check-cfg=cfg({alias})");
    if has_feature {
        println!("cargo:rustc-cfg={alias}");
    }
}

fn main() {
    cfg_alias("dev", is_dev());
}

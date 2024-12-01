const VALID_LINKS: [&'static str; 28] = [
    "https://www.dofuspourlesnoobs.com",
    "https://dofuspourlesnoobs.com",
    "https://huzounet.fr",
    "https://www.dofusbook.net",
    "https://dofusbook.net",
    "https://ganymede-dofus.com",
    "https://dofus-portals.fr",
    "https://www.youtube.com",
    "https://youtube.com",
    "https://twitter.com",
    "https://x.com",
    "https://www.dofus.com",
    "https://dofus.com",
    "https://www.twitch.tv",
    "https://twitch.tv",
    "https://metamob.fr",
    "https://dofusdb.fr",
    "https://barbofus.com",
    "https://dofensive.com",
    "https://www.dofuskin.com",
    "https://dofuskin.com",
    "https://docs.google.com",
    "https://www.dofustool.com",
    "https://dofustool.com",
    "https://www.krosmoz.com",
    "https://krosmoz.com",
    "https://www.gamosaurus.com",
    "https://gamosaurus.com",
];

#[tauri::command]
pub fn get_white_list<'a>() -> Result<Vec<&'a str>, ()> {
    Ok(VALID_LINKS.to_vec())
}

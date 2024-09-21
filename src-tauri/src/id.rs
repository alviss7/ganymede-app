use uuid::Uuid;

#[tauri::command]
pub fn new_id() -> String {
    Uuid::new_v4().to_string()
}

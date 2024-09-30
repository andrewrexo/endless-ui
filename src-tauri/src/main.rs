// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
	tauri::Builder::default()
		.invoke_handler(tauri::generate_handler![open_devtools])
		.run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn open_devtools(window: tauri::Window) {
  #[cfg(debug_assertions)]
  window.open_devtools();
}
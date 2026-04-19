const STORAGE_KEY = "playlistConfig";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("settings-form");
  const playlistInput = document.getElementById("playlist-url");
  const menuLabelInput = document.getElementById("menu-label");
  const status = document.getElementById("status");

  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const config = stored[STORAGE_KEY] || {};

  playlistInput.value = config.playlistUrl || config.playlistId || "";
  menuLabelInput.value = config.menuLabel || "Saved Playlist";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const playlistUrl = playlistInput.value.trim();
    const playlistId = normalizePlaylistId(playlistUrl);
    const menuLabel = menuLabelInput.value.trim() || "Saved Playlist";

    if (!playlistId) {
      status.textContent = "Paste a valid PMV Haven playlist URL or playlist ID.";
      status.className = "status error";
      return;
    }

    await chrome.storage.local.set({
      [STORAGE_KEY]: {
        playlistUrl,
        playlistId,
        menuLabel
      }
    });

    status.textContent = "Saved. Your right-click menu is ready.";
    status.className = "status success";
  });
});

function normalizePlaylistId(value) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    const match = url.pathname.match(/\/playlists\/([^/?#]+)/i);
    return match ? match[1] : "";
  } catch (_error) {
    const trimmed = value.trim();
    return /^[A-Za-z0-9_-]+$/.test(trimmed) ? trimmed : "";
  }
}

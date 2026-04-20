const playlistEl = document.getElementById("playlist");
const tabCountEl = document.getElementById("tab-count");
const currentPlaylistEl = document.getElementById("current-playlist");
const statusEl = document.getElementById("status");
const detailsEl = document.getElementById("details");
const addAllButton = document.getElementById("add-all");
const importCurrentButton = document.getElementById("import-current");
const playlistInput = document.getElementById("playlist-input");
const importPlaylistButton = document.getElementById("import-playlist");
const settingsButton = document.getElementById("settings");

document.addEventListener("DOMContentLoaded", async () => {
  await refreshState();
});

addAllButton.addEventListener("click", async () => {
  await runAction(
    { type: "add-all-tabs" },
    "Failed to add tabs.",
    (result) => {
      const successCount = result.successes.length;
      const failureCount = result.failures.length;

      if (successCount > 0 && failureCount === 0) {
        setStatus(`Added ${successCount} video${successCount === 1 ? "" : "s"}.`, "success");
      } else if (successCount > 0) {
        setStatus(
          `Added ${successCount} of ${result.requestedCount}. ${failureCount} failed.`,
          "error"
        );
      } else {
        setStatus("Nothing was added.", "error");
      }

      renderFailures(result.failures);
    }
  );
});

importCurrentButton.addEventListener("click", async () => {
  await runAction(
    { type: "import-current-playlist" },
    "Failed to import the current playlist.",
    (result) => {
      applyImportResult(result);
    }
  );
});

importPlaylistButton.addEventListener("click", async () => {
  await runAction(
    { type: "import-playlist", playlistInput: playlistInput.value.trim() },
    "Failed to import the playlist.",
    (result) => {
      applyImportResult(result);
    }
  );
});

settingsButton.addEventListener("click", async () => {
  await chrome.runtime.openOptionsPage();
});

async function refreshState() {
  const response = await chrome.runtime.sendMessage({ type: "get-config" });
  if (!response?.ok) {
    playlistEl.textContent = "Error";
    tabCountEl.textContent = "Error";
    currentPlaylistEl.textContent = "Error";
    setStatus(response?.error || "Could not read extension state.", "error");
    return;
  }

  const { config, openTabCount, currentPlaylist } = response;
  playlistEl.textContent = config.playlistId
    ? `${config.menuLabel} (${config.playlistId})`
    : "Not configured yet";
  tabCountEl.textContent = `${openTabCount} matching video tab${openTabCount === 1 ? "" : "s"}`;
  currentPlaylistEl.textContent = currentPlaylist?.playlistId || "No PMV Haven playlist page detected";
  importCurrentButton.disabled = !currentPlaylist?.playlistId;

  if (!config.playlistId) {
    setStatus("Set your playlist in Settings first.", "error");
    return;
  }

  if (currentPlaylist?.playlistId) {
    setStatus("Ready. You can import this playlist page or paste another one below.", "success");
    return;
  }

  if (openTabCount === 0) {
    setStatus("Open PMV Haven video tabs or a playlist page to use the bulk tools.", "");
    return;
  }

  setStatus("Ready.", "success");
}

async function runAction(message, fallbackError, onSuccess) {
  setStatus("Working...", "");
  clearFailures();
  setButtonsDisabled(true);

  const response = await chrome.runtime.sendMessage(message);
  setButtonsDisabled(false);

  if (!response?.ok) {
    setStatus(response?.error || fallbackError, "error");
    return;
  }

  onSuccess(response.result);
  await refreshState();
}

function applyImportResult(result) {
  const successCount = result.successes.length;
  const failureCount = result.failures.length;
  const sourceName = result.sourcePlaylistName || result.sourcePlaylistId;

  if (successCount > 0 && failureCount === 0) {
    setStatus(
      `Imported ${successCount} video${successCount === 1 ? "" : "s"} from ${sourceName}.`,
      "success"
    );
  } else if (successCount > 0) {
    setStatus(
      `Imported ${successCount} of ${result.requestedCount} from ${sourceName}. ${failureCount} failed.`,
      "error"
    );
  } else {
    setStatus(`Nothing was imported from ${sourceName}.`, "error");
  }

  renderFailures(result.failures);
}

function renderFailures(failures) {
  clearFailures();
  if (!Array.isArray(failures) || failures.length === 0) {
    return;
  }

  for (const failure of failures.slice(0, 5)) {
    const item = document.createElement("li");
    item.textContent = `${failure.videoId}: ${failure.message}`;
    detailsEl.appendChild(item);
  }
  detailsEl.hidden = false;
}

function clearFailures() {
  detailsEl.hidden = true;
  detailsEl.innerHTML = "";
}

function setButtonsDisabled(disabled) {
  addAllButton.disabled = disabled;
  if (disabled) {
    importCurrentButton.disabled = true;
  }
  importPlaylistButton.disabled = disabled;
  settingsButton.disabled = disabled;
}

function setStatus(message, kind) {
  statusEl.textContent = message;
  statusEl.className = kind ? `status ${kind}` : "status";
}

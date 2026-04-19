const playlistEl = document.getElementById("playlist");
const tabCountEl = document.getElementById("tab-count");
const statusEl = document.getElementById("status");
const detailsEl = document.getElementById("details");
const addAllButton = document.getElementById("add-all");
const settingsButton = document.getElementById("settings");

document.addEventListener("DOMContentLoaded", async () => {
  await refreshState();
});

addAllButton.addEventListener("click", async () => {
  setStatus("Working...", "");
  detailsEl.hidden = true;
  detailsEl.innerHTML = "";
  addAllButton.disabled = true;

  const response = await chrome.runtime.sendMessage({ type: "add-all-tabs" });
  addAllButton.disabled = false;

  if (!response?.ok) {
    setStatus(response?.error || "Failed to add tabs.", "error");
    return;
  }

  const result = response.result;
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

  if (failureCount > 0) {
    for (const failure of result.failures.slice(0, 5)) {
      const item = document.createElement("li");
      item.textContent = `${failure.videoId}: ${failure.message}`;
      detailsEl.appendChild(item);
    }
    detailsEl.hidden = false;
  }

  await refreshState();
});

settingsButton.addEventListener("click", async () => {
  await chrome.runtime.openOptionsPage();
});

async function refreshState() {
  const response = await chrome.runtime.sendMessage({ type: "get-config" });
  if (!response?.ok) {
    playlistEl.textContent = "Error";
    tabCountEl.textContent = "Error";
    setStatus(response?.error || "Could not read extension state.", "error");
    return;
  }

  const { config, openTabCount } = response;
  playlistEl.textContent = config.playlistId
    ? `${config.menuLabel} (${config.playlistId})`
    : "Not configured yet";
  tabCountEl.textContent = `${openTabCount} matching video tab${openTabCount === 1 ? "" : "s"}`;

  if (!config.playlistId) {
    setStatus("Set your playlist in Settings first.", "error");
    return;
  }

  if (openTabCount === 0) {
    setStatus("Open one or more PMV Haven video tabs first.", "");
    return;
  }

  setStatus("Ready.", "success");
}

function setStatus(message, kind) {
  statusEl.textContent = message;
  statusEl.className = kind ? `status ${kind}` : "status";
}

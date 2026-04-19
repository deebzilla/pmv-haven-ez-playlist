const STORAGE_KEY = "playlistConfig";
const MENU_IDS = {
  addLink: "pmvhaven-add-link",
  addPage: "pmvhaven-add-page",
  addAllTabs: "pmvhaven-add-all-tabs",
  openOptions: "pmvhaven-open-options"
};

const PMVHAVEN_HOSTS = new Set(["pmvhaven.com", "www.pmvhaven.com"]);
const HELPER_URL = "https://pmvhaven.com/playlists";

chrome.runtime.onInstalled.addListener(async () => {
  await createMenus();
});

chrome.runtime.onStartup.addListener(async () => {
  await createMenus();
});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === "local" && changes[STORAGE_KEY]) {
    await createMenus();
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") {
    return false;
  }

  if (message.type === "get-config") {
    getPlaylistConfig()
      .then(async (config) => {
        const videoIds = await collectOpenVideoIds();
        sendResponse({
          ok: true,
          config,
          openTabCount: videoIds.length
        });
      })
      .catch((error) => {
        sendResponse({
          ok: false,
          error: error.message || String(error)
        });
      });
    return true;
  }

  if (message.type === "add-all-tabs") {
    handleAddAllTabs()
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) =>
        sendResponse({
          ok: false,
          error: error.message || String(error)
        })
      );
    return true;
  }

  return false;
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    if (info.menuItemId === MENU_IDS.openOptions) {
      await chrome.runtime.openOptionsPage();
      return;
    }

    const config = await getPlaylistConfig();
    if (!config.playlistId) {
      await chrome.runtime.openOptionsPage();
      await showNotification(
        "Set your playlist first",
        "Open the extension options and paste your PMV Haven playlist URL or ID."
      );
      return;
    }

    if (info.menuItemId === MENU_IDS.addLink) {
      const videoId = extractVideoId(info.linkUrl || "");
      if (!videoId) {
        throw new Error("That link does not look like a PMV Haven video.");
      }
      const result = await addVideoIdsToPlaylist([videoId], config.playlistId);
      await showBatchResult(result, 1, config.menuLabel);
      return;
    }

    if (info.menuItemId === MENU_IDS.addPage) {
      const videoId = extractVideoId(tab?.url || info.pageUrl || "");
      if (!videoId) {
        throw new Error("This page is not a PMV Haven video.");
      }
      const result = await addVideoIdsToPlaylist([videoId], config.playlistId);
      await showBatchResult(result, 1, config.menuLabel);
      return;
    }

    if (info.menuItemId === MENU_IDS.addAllTabs) {
      const tabs = await chrome.tabs.query({});
      const videoIds = Array.from(
        new Set(
          tabs
            .map((openTab) => extractVideoId(openTab.url || ""))
            .filter(Boolean)
        )
      );

      if (videoIds.length === 0) {
        await showNotification(
          "No PMV Haven video tabs found",
          "Open one or more PMV Haven video tabs, then try again."
        );
        return;
      }

      const result = await addVideoIdsToPlaylist(videoIds, config.playlistId);
      await showBatchResult(result, videoIds.length, config.menuLabel);
    }
  } catch (error) {
    await showNotification("PMV Haven helper error", error.message || String(error));
  }
});

async function createMenus() {
  await chrome.contextMenus.removeAll();
  const config = await getPlaylistConfig();
  const label = config.menuLabel || "Saved Playlist";

  chrome.contextMenus.create({
    id: MENU_IDS.addLink,
    title: `Add linked PMV Haven video to ${label}`,
    contexts: ["link"]
  });

  chrome.contextMenus.create({
    id: MENU_IDS.addPage,
    title: `Add this PMV Haven video to ${label}`,
    contexts: ["page"],
    documentUrlPatterns: ["https://pmvhaven.com/video/*", "https://www.pmvhaven.com/video/*"]
  });

  chrome.contextMenus.create({
    id: MENU_IDS.addAllTabs,
    title: `Add all open PMV Haven tabs to ${label}`,
    contexts: ["action"]
  });

  chrome.contextMenus.create({
    id: MENU_IDS.openOptions,
    title: "Configure PMV Haven playlist helper",
    contexts: ["action", "page", "link"]
  });
}

async function getPlaylistConfig() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const raw = stored[STORAGE_KEY] || {};
  return {
    playlistId: normalizePlaylistId(raw.playlistId || raw.playlistUrl || ""),
    playlistUrl: raw.playlistUrl || "",
    menuLabel: (raw.menuLabel || "Saved Playlist").trim() || "Saved Playlist"
  };
}

function normalizePlaylistId(value) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    if (PMVHAVEN_HOSTS.has(url.hostname)) {
      const match = url.pathname.match(/\/playlists\/([^/?#]+)/i);
      return match ? match[1] : "";
    }
  } catch (_error) {
    // Treat the value as a raw playlist id when it is not a URL.
  }

  const trimmed = String(value).trim();
  const match = trimmed.match(/^[A-Za-z0-9_-]+$/);
  return match ? trimmed : "";
}

function extractVideoId(rawUrl) {
  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl);
    if (!PMVHAVEN_HOSTS.has(url.hostname)) {
      return null;
    }

    const slugMatch = url.pathname.match(/\/video\/[^/?#]*_([a-f0-9]{24})/i);
    if (slugMatch) {
      return slugMatch[1];
    }

    const idPathMatch = url.pathname.match(/\/videos\/([a-f0-9]{24})/i);
    if (idPathMatch) {
      return idPathMatch[1];
    }
  } catch (_error) {
    return null;
  }

  return null;
}

async function addVideoIdsToPlaylist(videoIds, playlistId) {
  const uniqueVideoIds = Array.from(new Set(videoIds.filter(Boolean)));
  if (uniqueVideoIds.length === 0) {
    throw new Error("No PMV Haven video IDs were found.");
  }

  const helperTab = await ensureHelperTab();
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: helperTab.tabId },
      world: "ISOLATED",
      func: runPlaylistAdditions,
      args: [playlistId, uniqueVideoIds]
    });

    if (!result) {
      throw new Error("PMV Haven did not return a result.");
    }

    if (result.authError) {
      throw new Error(
        "PMV Haven rejected the request. Make sure you are logged in there in this browser."
      );
    }

    return result;
  } finally {
    if (helperTab.created) {
      await chrome.tabs.remove(helperTab.tabId);
    }
  }
}

async function ensureHelperTab() {
  const tabs = await chrome.tabs.query({
    url: ["https://pmvhaven.com/*", "https://www.pmvhaven.com/*"]
  });

  const existing = tabs.find((tab) => tab.id && !tab.discarded);
  if (existing?.id) {
    await waitForTabComplete(existing.id);
    return { tabId: existing.id, created: false };
  }

  const tab = await chrome.tabs.create({ url: HELPER_URL, active: false });
  await waitForTabComplete(tab.id);
  return { tabId: tab.id, created: true };
}

async function waitForTabComplete(tabId) {
  const initialTab = await chrome.tabs.get(tabId);
  if (initialTab.status === "complete") {
    return;
  }

  await new Promise((resolve) => {
    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };

    chrome.tabs.onUpdated.addListener(listener);
  });
}

function runPlaylistAdditions(playlistId, videoIds) {
  const addOne = async (videoId) => {
    const apiUrl = `${window.location.origin}/api/playlists/${playlistId}/add-video`;
    const response = await fetch(apiUrl, {
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify({ videoId })
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (_error) {
      payload = null;
    }

    return {
      ok: response.ok && payload?.success !== false,
      status: response.status,
      payload
    };
  };

  return (async () => {
    const successes = [];
    const failures = [];
    let authError = false;

    for (const videoId of videoIds) {
      try {
        const result = await addOne(videoId);
        if (result.status === 401 || result.status === 403) {
          authError = true;
        }

        if (result.ok) {
          successes.push(videoId);
        } else {
          failures.push({
            videoId,
            message:
              result.payload?.statusMessage ||
              result.payload?.message ||
              `HTTP ${result.status}`
          });
        }
      } catch (error) {
        failures.push({
          videoId,
          message: error?.message || String(error)
        });
      }
    }

    return { successes, failures, authError };
  })();
}

async function showBatchResult(result, requestedCount, label) {
  const successCount = result.successes.length;
  const failureCount = result.failures.length;

  if (successCount > 0 && failureCount === 0) {
    await showNotification(
      "Playlist updated",
      `Added ${successCount} PMV Haven video${successCount === 1 ? "" : "s"} to ${label}.`
    );
    return;
  }

  if (successCount > 0) {
    await showNotification(
      "Playlist partly updated",
      `Added ${successCount} of ${requestedCount}. ${failureCount} failed.`
    );
    return;
  }

  const firstFailure = result.failures[0]?.message || "No videos were added.";
  await showNotification("Nothing added", firstFailure);
}

async function showNotification(title, message) {
  await chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon.png"),
    title,
    message
  });
}

async function collectOpenVideoIds() {
  const tabs = await chrome.tabs.query({});
  return Array.from(
    new Set(
      tabs
        .map((tab) => extractVideoId(tab.url || ""))
        .filter(Boolean)
    )
  );
}

async function handleAddAllTabs() {
  const config = await getPlaylistConfig();
  if (!config.playlistId) {
    throw new Error("No playlist is configured yet.");
  }

  const videoIds = await collectOpenVideoIds();
  if (videoIds.length === 0) {
    throw new Error("No open PMV Haven video tabs were found.");
  }

  const result = await addVideoIdsToPlaylist(videoIds, config.playlistId);
  await showBatchResult(result, videoIds.length, config.menuLabel);
  return {
    ...result,
    requestedCount: videoIds.length,
    playlistLabel: config.menuLabel
  };
}

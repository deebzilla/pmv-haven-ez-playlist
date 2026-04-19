# PMV Haven Playlist Helper

PMV Haven Playlist Helper is a Chrome and Edge extension that speeds up playlist curation on PMV Haven.

Instead of opening every video and clicking into the playlist flow one at a time, you can add videos directly from right-click menus or bulk-add all open PMV Haven video tabs from the popup.

## Features

- Add a PMV Haven video from a right-clicked link
- Add the currently open PMV Haven video page
- Bulk-add all open PMV Haven video tabs
- Save a default playlist once and reuse it
- See visible success and failure feedback in the popup

## Install Locally

1. Open `chrome://extensions/` in Chrome or `edge://extensions/` in Edge.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select this folder:

   `C:\Users\Deebz\Documents\ai-projects\pmvhaven_playlist_extension`

## Configure It

1. Open the extension details page.
2. Click `Extension options`.
3. Paste your PMV Haven playlist URL or raw playlist ID.
4. Optionally choose a custom label for the menu text.

Example:

`https://pmvhaven.com/playlists/your-playlist-id`

## Use It

### Right-click a link

- Right-click a PMV Haven video link.
- Choose `Add linked PMV Haven video to ...`

### Right-click the current page

- Open a PMV Haven video page.
- Right-click the page.
- Choose `Add this PMV Haven video to ...`

### Bulk-add open tabs

- Open one or more PMV Haven video tabs.
- Click the extension icon.
- Press `Add All Open PMV Tabs`.

The popup shows:

- the playlist currently configured
- how many matching PMV Haven video tabs were found
- failure details if PMV Haven rejects any requests

## How It Works

The extension uses your existing logged-in PMV Haven browser session and calls PMV Haven's playlist endpoints directly from the browser. It does not run a backend service and does not collect analytics.

## Privacy

See `PRIVACY.md`.

## Packaging A Release

Run:

```powershell
.\release.ps1
```

That creates:

`dist\pmvhaven-playlist-helper-v1.0.0.zip`

## Files Included For Publishing

- `PRIVACY.md`
- `STORE_LISTING.md`
- `SEND_TO_PMVHAVEN.md`
- `release.ps1`

## Notes

- You must be logged in to PMV Haven in the same browser profile.
- If no PMV Haven tab is open, the extension may briefly create a background helper tab to send playlist requests.
- Chrome Web Store and Edge Add-ons packaging is based on the same extension source.

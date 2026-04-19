# Store Listing Draft

## Name

PMV Haven Playlist Helper

## Short Description

Add PMV Haven videos to a playlist from right-click menus or in bulk from your open tabs.

## Detailed Description

PMV Haven Playlist Helper makes playlist management much faster for people who collect videos from PMV Haven.

Instead of opening every video one by one and adding it manually, this extension lets you:

- right-click a PMV Haven video link and add it directly to your chosen playlist
- right-click the current PMV Haven video page and add it instantly
- open the extension popup and bulk-add every open PMV Haven video tab in one click

The extension uses your existing PMV Haven browser session and sends add-to-playlist requests directly to PMV Haven. It does not run its own backend and does not collect analytics.

## Suggested Category

Productivity

## Suggested Screenshots To Capture

1. Popup showing configured playlist and open tab count
2. Right-click menu on a PMV Haven video link
3. Success state after bulk-adding tabs
4. Settings page with playlist URL field

## Permissions Justification

- `contextMenus`: adds right-click actions for PMV Haven links and pages
- `storage`: saves the selected playlist and menu label locally
- `tabs`: finds open PMV Haven video tabs for the bulk-add action
- `scripting`: runs the add-to-playlist request on a PMV Haven page
- `notifications`: shows clear success or failure feedback

## Support URL

Use the GitHub repository issues page once published.

## Privacy Policy URL

Publish the contents of `PRIVACY.md` on GitHub Pages, a gist, or your repo and link it here.

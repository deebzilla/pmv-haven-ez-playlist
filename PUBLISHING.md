# Publishing Guide

## What You Already Have

- Source repo folder ready for GitHub
- Privacy policy in `PRIVACY.md`
- Store listing draft in `STORE_LISTING.md`
- Outreach message in `SEND_TO_PMVHAVEN.md`
- Release zips in `dist\`

## Release Files

- `dist\pmvhaven-playlist-helper-extension-v1.0.0.zip`
  - Use this for Chrome Web Store and Microsoft Edge Add-ons submissions
- `dist\pmvhaven-playlist-helper-source-v1.0.0.zip`
  - Use this for GitHub releases or direct source sharing

## Publish To GitHub

### Option A: Create an empty repo manually, then push

1. Create a new repository on GitHub, for example:
   - `pmvhaven-playlist-helper`
2. Do not add a README or license on GitHub if you want to push this folder cleanly.
3. In this folder, run:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/pmvhaven-playlist-helper.git
git push -u origin main
```

### Option B: Upload the source zip to a GitHub release

After pushing the repo:

1. Open the repo on GitHub
2. Create a new release
3. Upload `dist\pmvhaven-playlist-helper-source-v1.0.0.zip`

## Publish To Chrome Web Store

1. Register as a Chrome Web Store developer
2. Pay the one-time registration fee
3. Open the Chrome Web Store Developer Dashboard
4. Upload:

`dist\pmvhaven-playlist-helper-extension-v1.0.0.zip`

5. Fill in the listing using `STORE_LISTING.md`
6. Add a privacy policy URL based on `PRIVACY.md`
7. Upload screenshots
8. Submit for review

## Publish To Microsoft Edge Add-ons

1. Open Partner Center for Edge Add-ons
2. Create a new extension submission
3. Upload:

`dist\pmvhaven-playlist-helper-extension-v1.0.0.zip`

4. Reuse the listing copy from `STORE_LISTING.md`
5. Add the privacy policy URL
6. Choose `Public` or `Hidden`
7. Submit for review

## Send To PMV Haven

Use `SEND_TO_PMVHAVEN.md` as the starting message.

Recommended extras:

- include the GitHub repo link
- include a short demo GIF or video
- mention that the extension uses PMV Haven's existing playlist flow
- offer the code as a native product feature prototype

# Rooted website

The public landing page for Rooted. It is a single static page with no build step: `index.html` plus the `images/` folder.

## Deploy on Vercel

1. In Vercel, choose **Add New > Project** and import this repository.
2. Set **Root Directory** to `website`.
3. Set **Framework Preset** to **Other**. Leave the build and output settings empty.
4. Deploy. Every push to `main` that changes `website/` redeploys it.

The app itself stays in its own Vercel project (root directory `frontend`), at https://rooted2-0.vercel.app.

## Editing

- **Links:** the app link and GitHub link appear in `index.html`. Search for `rooted2-0.vercel.app` to change the app link.
- **Flipbook photos:** stored in `images/` as 960 x 1200 JPEGs (4:5), all colour-graded to the same warm tone and brightness. To add a photo, add the file and a matching row to the `envs` list in the script at the bottom of `index.html`.
- **Hover words:** the `occ` list in the same script. Each entry is `[WORD, photo number]`, where the photo number is the photo's position in `envs`, counting from 0. A photo number of `-1` shows the word without pausing the flipbook.

## Preview locally

Open `index.html` in a browser, or run `python3 -m http.server` inside this folder and visit http://localhost:8000.

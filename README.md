# SBC Skipper course

Static site for club member training (GitHub Pages). Modules m0-m7; diagrams are inline SVG; media slots fill themselves.

## Adding footage

- Every club media slot has an ID (shown in the placeholder, e.g. **M1-01**). Name files exactly and drop them in this repo:
  - `vid/M1-01.mp4` - video
  - `img/M3-04.jpg` - still
- The live page replaces the placeholder with a player automatically once the file exists. Test by refreshing the page.
- Refresher slots (e.g. "M1-03/04 refresher") replay the referenced clips - no separate files needed.
- Phone footage is already H.264 MP4 (the format browsers want). Keep it landscape. Compress to ~720p before committing, e.g. `ffmpeg -i in.mp4 -c:v libx264 -crf 28 -vf scale=-2:720 out.mp4`.
- Optional `media.json` maps a slot ID to an externally hosted URL (Cloudflare Stream / unlisted YouTube) - checked before local files. Use it for large footage: this site is PUBLIC and GitHub Pages caps sites at ~1 GB with ~100 GB/month bandwidth.

## Media slot notes

- `M0-01` appears in two places on Module 0 (intro + Lesson 0.1) - one file serves both.
- The `PHOTO - buoy` slot in L3.7 has no ID - it is filled manually when footage exists.

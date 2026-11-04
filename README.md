# Lab Memory (single-page demo)

A fake desktop full of messy lab files, plus an agent dock with preset requests. Click **Find all files related to experiments done ~2 weeks ago**: the matching icons glow, fly into a box, and faded ghosts stay behind. Nothing is moved.

Frontend only; all data is hardcoded in `frontend/src/files.js`.

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

Reset button (menu bar, top right) restores the desktop.

## History (version log)

The **History** button (menu bar) opens a git-style log of who added what, when, and a short note. Each commit has **Before** / **After** buttons that show the drive as it was at that point (files added by the commit are outlined green; "Back to latest" returns). Three files are intentionally uncommitted: pick a user, tick files, write a note and **Commit** to add a new entry live. Preset queries respect whichever snapshot you're viewing. Commits are hardcoded/in-memory (`frontend/src/versions.js`); Reset restores them.
# organizeLAB

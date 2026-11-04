// Hardcoded demo "version control": an in-memory commit list. A snapshot is just the union of what commits added.
export const USERS = {
  Jeremy: { color: "#3ed598" },
  Sarah: { color: "#8f8bff" },
  Priya: { color: "#ffb454" },
};

const DAY = 86400000;
const now = Date.now();
const c = (id, author, daysAgo, note, added) => ({ id, author, ts: now - daysAgo * DAY, note, added });

// Oldest first. Three files are deliberately left out so they can be committed live in the demo.
export const SEED_COMMITS = [
  c("a3f91c2", "Priya", 220, "Import legacy drive dump", ["old_data/final_final_v2.csv", "old_data/unknown_experiment.csv"]),
  c("7be04d8", "Jeremy", 32, "Add exp14 notes + 24h control", ["Jeremy/mito_project/exp14/notes.txt", "Jeremy/mito_project/exp14/control_24h.csv"]),
  c("1c58e6a", "Jeremy", 16, "Exp15 notes + first control replicate", ["Jeremy/mito_project/exp15/notes.txt", "Jeremy/mito_project/exp15/raw/CTRL24_rep1.csv"]),
  c("d02a7f3", "Jeremy", 15, "Exp15 H48 raw, replicates 1-2", ["Jeremy/mito_project/exp15/raw/H48_rep1.csv", "Jeremy/mito_project/exp15/raw/H48_rep2.csv"]),
  c("94e1b05", "Jeremy", 13, "H48 replicate 3 + processed file from old folder", ["Jeremy/mito_project/exp15/raw/H48_rep3.csv", "Jeremy_old/H48_final.csv"]),
  c("5f3ac17", "Sarah", 12, "Microscopy: hypoxia 01/02 and control 01", ["Sarah/microscopy/exp15_hypoxia_01.tif", "Sarah/microscopy/exp15_hypoxia_02.tif", "Sarah/microscopy/exp15_control_01.tif"]),
  c("e8b2260", "Jeremy", 11, "Add final_analysis.csv", ["Jeremy/mito_project/exp15/analysis/final_analysis.csv"]),
];

export const hashOf = () => Math.random().toString(16).slice(2, 9).padEnd(7, "0");

/** File ids present after applying commits[0..upto] (inclusive). upto = -1 gives the empty dataset. */
export function snapshot(commits, upto) {
  const s = new Set();
  for (let i = 0; i <= upto && i < commits.length; i++) commits[i].added.forEach((id) => s.add(id));
  return s;
}

export function relTime(ts) {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 14) return `${d} day${d !== 1 ? "s" : ""} ago`;
  if (d < 60) return `${Math.round(d / 7)} weeks ago`;
  return `${Math.round(d / 30)} months ago`;
}

export const absTime = (ts) => new Date(ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

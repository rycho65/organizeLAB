// Hardcoded demo data: the lab's "physical" files plus the metadata Lab Memory inferred for them.
const f = (path, daysAgo, o = {}) => ({
  id: path, path: `demo_lab/${path}`, name: path.split("/").pop(), ext: path.split(".").pop(),
  daysAgo, researcher: null, identity: null, bucket: "Unknown / Other Data", confidence: 0.31, ...o,
});

const hyp = { researcher: "Jeremy", confidence: 0.96 };

// Deliberately shuffled so the desktop looks like a real, messy drive.
export const FILES = [
  f("old_data/final_final_v2.csv", 210),
  f("Sarah/microscopy/exp15_hypoxia_01.tif", 12, { researcher: "Sarah", confidence: 0.93, identity: "Experiment 15 · Hypoxia · Replicate 1", bucket: "Experiment 15 / Hypoxia / Microscopy" }),
  f("Jeremy/mito_project/exp15/raw/H48_rep2.csv", 14, { ...hyp, identity: "Experiment 15 · Hypoxia · 48h · Replicate 2", bucket: "Experiment 15 / Hypoxia / 48h / Raw Data" }),
  f("Jeremy/mito_project/exp14/notes.txt", 32, { researcher: "Jeremy", confidence: 0.8, identity: "Experiment 14 · Notes", bucket: "Experiment 14 / Notes" }),
  f("Jeremy_old/H48_final.csv", 13, { ...hyp, identity: "Experiment 15 · Hypoxia · 48h", bucket: "Experiment 15 / Hypoxia / 48h / Processed Data" }),
  f("Sarah/microscopy/exp15_control_01.tif", 13, { researcher: "Sarah", confidence: 0.93, identity: "Experiment 15 · Control · Replicate 1", bucket: "Experiment 15 / Control / Microscopy" }),
  f("Jeremy/mito_project/exp15/raw/CTRL24_rep1.csv", 15, { ...hyp, identity: "Experiment 15 · Control · 24h · Replicate 1", bucket: "Experiment 15 / Control / 24h / Raw Data" }),
  f("old_data/unknown_experiment.csv", 220),
  f("Jeremy/mito_project/exp15/raw/H48_rep3.csv", 13, { ...hyp, identity: "Experiment 15 · Hypoxia · 48h · Replicate 3", bucket: "Experiment 15 / Hypoxia / 48h / Raw Data" }),
  f("Jeremy/mito_project/exp15/notes.txt", 16, { researcher: "Jeremy", confidence: 0.8, identity: "Experiment 15 · Notes", bucket: "Experiment 15 / Notes" }),
  f("Sarah/microscopy/exp15_hypoxia_02.tif", 11, { researcher: "Sarah", confidence: 0.93, identity: "Experiment 15 · Hypoxia · Replicate 2", bucket: "Experiment 15 / Hypoxia / Microscopy" }),
  f("Jeremy/mito_project/exp14/control_24h.csv", 31, { researcher: "Jeremy", confidence: 0.9, identity: "Experiment 14 · Control · 24h", bucket: "Experiment 14 / Control / 24h / Other Data" }),
  f("Jeremy/mito_project/exp15/analysis/final_analysis.csv", 11, { ...hyp, identity: "Experiment 15 · Hypoxia · 48h", bucket: "Experiment 15 / Hypoxia / 48h / Analysis" }),
  f("Jeremy/mito_project/exp15/raw/H48_rep1.csv", 15, { ...hyp, identity: "Experiment 15 · Hypoxia · 48h · Replicate 1", bucket: "Experiment 15 / Hypoxia / 48h / Raw Data" }),
  f("Jeremy_old/exp15_moredata.csv", 15, { researcher: "Jeremy", confidence: 0.74, identity: "Experiment 15", bucket: "Experiment 15 / Unknown / Other Data" }),
  f("Sarah/microscopy/exp15_control_02.tif", 12, { researcher: "Sarah", confidence: 0.93, identity: "Experiment 15 · Control · Replicate 2", bucket: "Experiment 15 / Control / Microscopy" }),
  f("Jeremy/mito_project/exp15/raw/CTRL24_rep2.csv", 14, { ...hyp, identity: "Experiment 15 · Control · 24h · Replicate 2", bucket: "Experiment 15 / Control / 24h / Raw Data" }),
];

// Preset agent requests. `match` is the structured metadata query the request is "translated" into.
export const QUERIES = [
  {
    id: "weeks", primary: true,
    label: "Find all files related to experiments done ~2 weeks ago",
    title: "Experiments ~2 weeks ago",
    interpreted: [["Date", "≈ 14 days ago (10–18 days)"], ["Scope", "experiment files"]],
    match: (x) => x.daysAgo >= 10 && x.daysAgo <= 18,
  },
  {
    id: "jeremy", label: "Jeremy's hypoxia data", title: "Jeremy · Hypoxia",
    interpreted: [["Researcher", "Jeremy"], ["Condition", "Hypoxia"]],
    match: (x) => x.researcher === "Jeremy" && x.identity?.includes("Hypoxia"),
  },
  {
    id: "h48", label: "What does H48 mean?", title: "Files that use H48",
    interpreted: [["Vocabulary term", "H48"]],
    answer: "In this lab, H48 refers to samples exposed to hypoxia for 48 hours.",
    match: (x) => /h48/i.test(x.path),
  },
  {
    id: "unknown", label: "Show unidentified files", title: "Needs review",
    interpreted: [["Confidence", "below 60%"]],
    answer: "I couldn't confidently determine where these belong, so I haven't guessed.",
    match: (x) => x.confidence < 0.6,
  },
];

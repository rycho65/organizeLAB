import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { FileSpreadsheet, FileText, Image, ShieldCheck, Sparkles, RotateCcw, Lock, AlertCircle, History as HistoryIcon } from "lucide-react";
import { FILES, QUERIES } from "./files";
import History from "./History";
import { SEED_COMMITS, hashOf, snapshot } from "./versions";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const KIND = { csv: [FileSpreadsheet, "csv"], tif: [Image, "tif"], txt: [FileText, "txt"] };

function Glyph({ ext, size = 30 }) {
  const [Icon, cls] = KIND[ext];
  return <span className={`glyph ${cls}`}><Icon size={size} strokeWidth={1.6} /></span>;
}

/** One card in the result window. FLIPs from the matching desktop icon's position into place. */
function Tile({ f, i }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const src = [...document.querySelectorAll("[data-id]")].find((el) => el.dataset.id === f.id);
    const el = ref.current;
    if (!src) return;
    const a = src.getBoundingClientRect(), b = el.getBoundingClientRect();
    el.style.transition = "none";
    el.style.opacity = "0.9";
    el.style.transform = `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(.45)`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transition = `transform .95s cubic-bezier(.2,.8,.2,1) ${i * 70}ms, opacity .4s ${i * 70}ms`;
      el.style.transform = "none";
      el.style.opacity = "1";
    }));
  }, []);
  const unknown = f.confidence < 0.6;
  return (
    <div className="tile" ref={ref}>
      <Glyph ext={f.ext} size={22} />
      <div className="tile-body">
        <div className="tile-name">{f.name} <span className={`conf ${unknown ? "low" : ""}`}>{Math.round(f.confidence * 100)}%</span></div>
        {unknown
          ? <div className="tile-id warn"><AlertCircle size={12} /> Couldn't confidently determine where this belongs</div>
          : <div className="tile-id">{f.identity}{f.researcher ? ` · ${f.researcher}` : ""}</div>}
        <div className="tile-virtual">Virtual: {f.bucket}</div>
        <div className="tile-path">Physical: {f.path}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("idle"); // idle | typing | thinking | glow | fly | done
  const [q, setQ] = useState(null);
  const [typed, setTyped] = useState("");
  const [matched, setMatched] = useState(new Set());
  const token = useRef(0);
  const [commits, setCommits] = useState(SEED_COMMITS);
  const [histOpen, setHistOpen] = useState(false);
  const [view, setView] = useState(null); // null = latest, else { index, side: "before" | "after" }

  const head = useMemo(() => snapshot(commits, commits.length - 1), [commits]);
  const visible = useMemo(() => (view ? snapshot(commits, view.side === "before" ? view.index - 1 : view.index) : head), [commits, view, head]);
  const added = view?.side === "after" ? new Set(commits[view.index].added) : null;

  async function start(query) {
    const t = ++token.current;
    const alive = () => t === token.current;
    setHistOpen(false);
    setQ(null); setMatched(new Set()); setPhase("typing"); setTyped("");
    for (let i = 1; i <= query.label.length; i++) {
      if (!alive()) return;
      setTyped(query.label.slice(0, i));
      await sleep(20);
    }
    setPhase("thinking"); setQ(query);
    await sleep(900); if (!alive()) return;
    setMatched(new Set(FILES.filter((x) => visible.has(x.id) && query.match(x)).map((x) => x.id)));
    setPhase("glow");
    await sleep(1100); if (!alive()) return;
    setPhase("fly");
    await sleep(1800); if (!alive()) return;
    setPhase("done");
  }

  function reset() {
    token.current++;
    setPhase("idle"); setQ(null); setTyped(""); setMatched(new Set());
  }

  function resetAll() {
    reset();
    setCommits(SEED_COMMITS); setView(null); setHistOpen(false);
  }

  function openHistory() {
    if (histOpen) return setHistOpen(false);
    reset(); setHistOpen(true);
  }

  function commit({ author, note, added }) {
    setCommits([...commits, { id: hashOf(), author, ts: Date.now(), note, added }]);
    setView({ index: commits.length, side: "after" });
  }

  const moved = phase === "fly" || phase === "done";
  const results = q ? FILES.filter((x) => matched.has(x.id)) : [];
  const busy = phase === "typing" || phase === "thinking" || phase === "glow";

  return (
    <div className="screen">
      <div className="menubar">
        <b>◆ Lab Memory</b><span>File</span><span>Edit</span><span>View</span>
        <div className="grow" />
        {view && (
          <span className="banner">
            Viewing {commits[view.index].id} · {view.side}
            <button onClick={() => setView(null)}>Back to latest</button>
          </span>
        )}
        <button className={`reset ${histOpen ? "on" : ""}`} onClick={openHistory}><HistoryIcon size={12} /> History</button>
        {(phase !== "idle" || histOpen || view || commits !== SEED_COMMITS) && <button className="reset" onClick={resetAll}><RotateCcw size={12} /> Reset</button>}
        <span>{new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
      </div>

      <div className="desktop">
        <div className="drive-label"><Lock size={12} /> demo_lab · shared lab drive</div>
        <div className="grid">
          {FILES.map((x) => (
            <div key={x.id} data-id={x.id} title={x.path}
              className={`icon ${phase === "glow" && matched.has(x.id) ? "glow" : ""} ${moved && matched.has(x.id) ? "ghost" : ""} ${visible.has(x.id) ? "" : "absent"} ${added?.has(x.id) ? "added" : ""}`}>
              <Glyph ext={x.ext} />
              <span className="label">{x.name}</span>
            </div>
          ))}
        </div>

        {histOpen && (
          <History commits={commits} view={view} onView={setView} onCommit={commit}
            uncommitted={FILES.filter((x) => !head.has(x.id))} />
        )}

        {moved && q && !histOpen && (
          <div className="window">
            <div className="titlebar">
              <span className="dots"><i /><i /><i /></span>
              <span className="wtitle">{q.title} · {results.length} file{results.length !== 1 && "s"}</span>
            </div>
            <div className="wbody">
              {q.answer && phase === "done" && <div className="answer"><Sparkles size={15} /> {q.answer}</div>}
              <div className="tiles">{results.map((x, i) => <Tile key={x.id} f={x} i={i} />)}</div>
            </div>
            <div className="wfoot"><ShieldCheck size={14} /> 0 files moved · originals untouched. Faded icons mark where each file still lives.</div>
          </div>
        )}
      </div>

      <div className="dock">
        {q && (
          <div className="agent">
            <span className="agent-tag"><Sparkles size={12} /> Lab Memory</span>
            {phase === "thinking" && "Translating your request into a metadata query…"}
            {phase === "glow" && `Matched ${matched.size} files in the catalog. Grouping them…`}
            {moved && "Interpreted as:"}
            {moved && q.interpreted.map(([k, v]) => <span key={k} className="pill"><em>{k}</em> = {v}</span>)}
          </div>
        )}
        <div className="chips">
          {QUERIES.map((c) => (
            <button key={c.id} className={`chip ${c.primary ? "primary" : ""}`} disabled={busy} onClick={() => start(c)}>
              {c.primary && <Sparkles size={13} />} {c.label}
            </button>
          ))}
        </div>
        <div className="bar">
          <input disabled value={typed} placeholder="Pick a request above (free text coming soon)" readOnly />
          <span className="send">↵</span>
        </div>
      </div>
    </div>
  );
}

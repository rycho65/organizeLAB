import { useState } from "react";
import { GitCommitHorizontal, Plus } from "lucide-react";
import { FILES } from "./files";
import { USERS, relTime, absTime } from "./versions";

const byId = Object.fromEntries(FILES.map((f) => [f.id, f]));

/** Git-ish log window: who / when / note, Before/After per commit, and a form to commit the not-yet-tracked files. */
export default function History({ commits, view, onView, uncommitted, onCommit }) {
  const [author, setAuthor] = useState("Sarah");
  const [note, setNote] = useState("");
  const [picked, setPicked] = useState(new Set());

  const toggle = (id) => setPicked((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const ready = picked.size > 0 && note.trim();
  function submit(e) {
    e.preventDefault();
    if (!ready) return;
    onCommit({ author, note: note.trim(), added: [...picked] });
    setNote(""); setPicked(new Set());
  }

  return (
    <div className="window history">
      <div className="titlebar">
        <span className="dots"><i /><i /><i /></span>
        <span className="wtitle">History · {commits.length} commits</span>
      </div>
      <div className="wbody">
        <div className="log">
          {commits.map((cm, i) => ({ cm, i })).reverse().map(({ cm, i }) => {
            const sel = view?.index === i ? view.side : null;
            return (
              <div key={cm.id} className={`commit ${sel ? "sel" : ""}`}>
                <span className="avatar" style={{ background: USERS[cm.author].color }}>{cm.author[0]}</span>
                <div className="commit-main">
                  <div className="commit-note">{cm.note}</div>
                  <div className="commit-meta">
                    <b>{cm.author}</b> · <span title={absTime(cm.ts)}>{relTime(cm.ts)}</span> · <span className="hash">{cm.id}</span> · <span className="badge">+{cm.added.length} file{cm.added.length !== 1 && "s"}</span>
                  </div>
                  <div className="commit-files">{cm.added.map((id) => byId[id].name).join(", ")}</div>
                </div>
                <div className="seg">
                  <button className={sel === "before" ? "on" : ""} onClick={() => onView({ index: i, side: "before" })}>Before</button>
                  <button className={sel === "after" ? "on" : ""} onClick={() => onView({ index: i, side: "after" })}>After</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <form className="stage" onSubmit={submit}>
        <div className="stage-head"><GitCommitHorizontal size={14} /> Commit changes
          <select value={author} onChange={(e) => setAuthor(e.target.value)} aria-label="Committing as">
            {Object.keys(USERS).map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
        {uncommitted.length === 0
          ? <div className="stage-empty">Everything on the drive is tracked.</div>
          : uncommitted.map((f) => (
            <label key={f.id} className="stage-file">
              <input type="checkbox" checked={picked.has(f.id)} onChange={() => toggle(f.id)} />
              <Plus size={11} /> <span>{f.name}</span>
            </label>
          ))}
        <div className="stage-row">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Short note about what you added" maxLength={80} disabled={!uncommitted.length} />
          <button type="submit" disabled={!ready}>Commit</button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { TIERS, CHANNELS, NOW_SEARCH_URL } from "./data/config.js";
import { CATALOGUE } from "./data/catalogue.js";
import { handleArrowKeys } from "./nav.js";
import { isApp, openNowApp } from "./native.js";

const STORE = "nowguide.tiers";
const load = () => {
  try { return JSON.parse(localStorage.getItem(STORE)); } catch { return null; }
};

const VERSION = "v5";

function DebugBar() {
  const [last, setLast] = useState("none yet");
  useEffect(() => {
    const f = (e) => setLast(`${e.type} key=${e.key} code=${e.keyCode}`);
    window.addEventListener("keydown", f, true);
    window.addEventListener("keyup", f, true);
    window.addEventListener("click", () => setLast("click"), true);
    window.addEventListener("error", (e) => setLast("ERROR " + e.message));
    return () => {
      window.removeEventListener("keydown", f, true);
      window.removeEventListener("keyup", f, true);
    };
  }, []);
  return <div className="debug">{VERSION} | last button: {last}</div>;
}

export default function App() {
  const [tiers, setTiers] = useState(load);
  const [setup, setSetup] = useState(!load());
  const [tab, setTab] = useState("top10");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    window.addEventListener("keydown", handleArrowKeys);
    return () => window.removeEventListener("keydown", handleArrowKeys);
  }, []);

  useEffect(() => {
    if (!selected) document.querySelector("[data-row]")?.focus();
  }, [tab, setup, selected]);

  const myChannels = useMemo(() => CHANNELS.filter((c) => tiers?.includes(c.tier)), [tiers]);
  // The key rule: only titles on channels you can watch are ever shown.
  const watchable = useMemo(
    () => CATALOGUE.filter((t) => myChannels.some((c) => c.id === t.channel)),
    [myChannels]
  );

  if (setup) {
    return <><DebugBar /><Setup initial={tiers || ["entertainment"]} onDone={(t) => {
      try { localStorage.setItem(STORE, JSON.stringify(t)); } catch {}
      setTiers(t); setSetup(false);
    }} /></>;
  }

  const tabs = [{ id: "top10", label: "Top 10" }, { id: "all", label: "All" }, ...myChannels.map((c) => ({ id: c.id, label: c.label }))];
  const rows = buildRows(tab, watchable);

  return (
    <div className="app">
      <nav className="tabs">
        {tabs.map((t, i) => (
          <button key={t.id} data-row={0} data-col={i} className={tab === t.id ? "on" : ""}
            onFocus={() => setTab(t.id)} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
        <button data-row={0} data-col={tabs.length} className="gear" onClick={() => setSetup(true)}>My passes</button>
      </nav>
      <main>
        {rows.length === 0 && <p className="empty">Nothing here for your passes.</p>}
        {rows.map((row, r) => (
          <section key={row.name}>
            <h2>{row.name}</h2>
            <div className="row">
              {row.items.map((t, c) => (
                <button key={t.id} data-row={r + 1} data-col={c} className="card" onClick={() => setSelected(t)}>
                  {tab === "top10" && <span className="rank">{t.rank}</span>}
                  <strong>{t.title}</strong>
                  <small>{CHANNELS.find((x) => x.id === t.channel)?.label}</small>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>
      {selected && <Detail t={selected} onClose={() => setSelected(null)} />}
      <DebugBar />
    </div>
  );
}

function buildRows(tab, items) {
  if (tab === "top10") {
    const top = items.filter((t) => t.rank && t.rank <= 10).sort((a, b) => a.rank - b.rank);
    return top.length ? [{ name: "Top 10 on your channels", items: top }] : [];
  }
  const pool = tab === "all" ? items : items.filter((t) => t.channel === tab);
  const genres = [...new Set(pool.flatMap((t) => t.genres))].sort();
  return genres.map((g) => ({ name: g, items: pool.filter((t) => t.genres.includes(g)) }));
}

function Setup({ initial, onDone }) {
  const [sel, setSel] = useState(initial);
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <div className="app setup">
      <h1>What do you have on NOW?</h1>
      <p>Anything you leave unticked will be hidden everywhere.</p>
      <div className="row">
        {TIERS.map((t, i) => (
          <button key={t.id} data-row={0} data-col={i} className={"card " + (sel.includes(t.id) ? "on" : "")} onClick={() => toggle(t.id)}>
            <strong>{sel.includes(t.id) ? "✓ " : ""}{t.label}</strong>
          </button>
        ))}
      </div>
      <button data-row={1} data-col={0} className="primary" onClick={() => onDone(sel)}>Done</button>
    </div>
  );
}

function Detail({ t, onClose }) {
  const url = NOW_SEARCH_URL.replace("{title}", encodeURIComponent(t.title));
  const [msg, setMsg] = useState("");
  const open = async (e) => {
    if (!isApp) return; // in a normal browser, fall through to the website link
    e.preventDefault();
    const ok = await openNowApp();
    if (!ok) setMsg("Couldn't find the NOW app. Is it installed on this Fire Stick?");
  };
  useEffect(() => {
    const k = (e) => { if (e.key === "Escape" || e.key === "Backspace") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="modal">
      <h1>{t.title}</h1>
      <p>{CHANNELS.find((x) => x.id === t.channel)?.label} · {t.genres.join(", ")}</p>
      <a data-row={100} data-col={0} className="primary" href={url} onClick={open} autoFocus>Open NOW app</a>
      <p>Then look for: <strong>{t.title}</strong> on {CHANNELS.find((x) => x.id === t.channel)?.label}</p>
      {msg && <p>{msg}</p>}
      <button data-row={101} data-col={0} onClick={onClose}>Back</button>
    </div>
  );
}

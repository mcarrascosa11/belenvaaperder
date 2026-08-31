'use client';
import { useEffect, useMemo, useState } from 'react';

type Player = 'Marcos' | 'Belén';
type Entry = { score: number; note?: string };
type Scores = Record<Player, (Entry | null)[]>;

const empty: Scores = { Marcos: Array(7).fill(null), Belén: Array(7).fill(null) };
const KEY = 'belenvaaperder:scores:v1';

function total(items: (Entry | null)[]) { return items.reduce((s, x) => s + (x?.score || 0), 0); }
function fmt(n: number) { return n.toLocaleString('es-ES'); }

export default function Home() {
  const [scores, setScores] = useState<Scores>(empty);
  const [player, setPlayer] = useState<Player>('Marcos');
  const [day, setDay] = useState(1);
  const [score, setScore] = useState('');
  const [note, setNote] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setScores(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(scores)); }, [scores, loaded]);

  const totals = useMemo(() => ({ Marcos: total(scores.Marcos), Belén: total(scores.Belén) }), [scores]);
  const played = useMemo(() => Math.max(...Object.values(scores).map(arr => arr.filter(Boolean).length)), [scores]);
  const loser = played === 7 && totals.Marcos !== totals.Belén ? (totals.Marcos < totals.Belén ? 'Marcos' : 'Belén') : null;

  function save() {
    const n = Number(score.replace(/\D/g, ''));
    if (!n || n < 0 || n > 25000) return;
    setScores(s => ({ ...s, [player]: s[player].map((x, i) => i === day - 1 ? { score: n, note: note.trim() || undefined } : x) }));
    setScore(''); setNote('');
  }
  function clearAll() { if (confirm('¿Borrar todas las puntuaciones?')) setScores(empty); }
  function copySummary() {
    const rows = Array.from({length:7}, (_, i) => `${i+1}. ${scores.Marcos[i]?.score ?? '—'} | ${scores['Belén'][i]?.score ?? '—'}`).join('\n');
    navigator.clipboard?.writeText(`BELÉN VA A PERDER\n${rows}\nTOTAL Marcos: ${totals.Marcos}\nTOTAL Belén: ${totals.Belén}`);
  }

  return <main>
    <div className="wrap">
      <header><div><span className="eyebrow">GEOGUESSR · DAILY CHALLENGE</span><h1>BE LÉN VA A PERDER</h1><p>7 días. Una sola perdedora.</p></div><button className="ghost" onClick={copySummary}>Copiar marcador</button></header>
      <section className="hero">
        <div className="scorebox"><span>MARCOS</span><strong>{fmt(totals.Marcos)}</strong><small>{scores.Marcos.filter(Boolean).length}/7 días</small></div>
        <div className="vs">VS</div>
        <div className="scorebox"><span>BELÉN</span><strong>{fmt(totals.Belén)}</strong><small>{scores.Belén.filter(Boolean).length}/7 días</small></div>
      </section>
      {loser && <div className="loser">🚨 EL RETO ES PARA <b>{loser.toUpperCase()}</b> 🚨</div>}
      {!loser && <div className="status">{played === 0 ? 'EMPEZAD CUANDO QUERÁIS' : `DÍA ${played} · ${totals.Marcos === totals.Belén ? 'EMPATE' : totals.Marcos > totals.Belén ? 'MARCOS VA POR DELANTE' : 'BELÉN VA POR DELANTE'}`}</div>}

      <section className="card">
        <h2>Apuntar partida</h2>
        <div className="formgrid">
          <label>Jugador<select value={player} onChange={e => setPlayer(e.target.value as Player)}><option>Marcos</option><option>Belén</option></select></label>
          <label>Día<select value={day} onChange={e => setDay(Number(e.target.value))}>{[1,2,3,4,5,6,7].map(d=><option key={d} value={d}>Día {d}</option>)}</select></label>
          <label>Puntuación<input inputMode="numeric" value={score} onChange={e => setScore(e.target.value)} placeholder="Ej. 21.437" /></label>
          <label>Nota <span className="muted">(opcional)</span><input value={note} onChange={e => setNote(e.target.value)} placeholder="He roto la racha…" /></label>
        </div>
        <button className="primary" onClick={save}>Guardar puntuación</button>
      </section>

      <section className="card tablecard">
        <div className="tablehead"><h2>Marcador</h2><button className="danger" onClick={clearAll}>Reiniciar</button></div>
        <table><thead><tr><th>Día</th><th>Marcos</th><th>Belén</th><th>Ganador del día</th></tr></thead><tbody>
          {[1,2,3,4,5,6,7].map(d => { const a=scores.Marcos[d-1]?.score, b=scores.Belén[d-1]?.score; return <tr key={d}><td>{d}</td><td>{a ? fmt(a) : '—'}</td><td>{b ? fmt(b) : '—'}</td><td>{a && b ? a === b ? 'Empate' : a > b ? 'Marcos' : 'Belén' : '—'}</td></tr> })}
          <tr className="total"><td>TOTAL</td><td>{fmt(totals.Marcos)}</td><td>{fmt(totals.Belén)}</td><td>{totals.Marcos===totals.Belén?'Empate':totals.Marcos>totals.Belén?'Marcos':'Belén'}</td></tr>
        </tbody></table>
      </section>
      <footer>Regla: al terminar los 7 Daily Challenges, quien tenga MENOS puntos hace el reto.</footer>
    </div>
    <style jsx global>{`*{box-sizing:border-box}body{margin:0;background:#0b0b0d;color:#f4f1ea;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button,input,select{font:inherit}button{cursor:pointer}.wrap{max-width:980px;margin:auto;padding:32px 20px 50px}header{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:28px}.eyebrow{font-size:12px;letter-spacing:.16em;color:#a9a29a}h1{font-size:clamp(34px,7vw,72px);line-height:.92;margin:8px 0;font-weight:950;letter-spacing:-.06em}header p{margin:0;color:#aaa39a}.ghost,.danger{background:none;border:1px solid #39393e;color:#ddd;padding:10px 14px;border-radius:10px}.hero{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:center;margin:25px 0}.scorebox{background:#151518;border:1px solid #29292f;border-radius:18px;padding:26px;text-align:center}.scorebox span{font-size:12px;letter-spacing:.16em;color:#aaa}.scorebox strong{display:block;font-size:clamp(36px,7vw,64px);letter-spacing:-.05em;margin:8px 0}.scorebox small{color:#777}.vs{font-weight:900;color:#777}.status,.loser{border-radius:14px;padding:14px;text-align:center;margin-bottom:18px;font-weight:800;letter-spacing:.08em}.status{background:#141416;color:#c9c2ba;border:1px solid #29292f}.loser{background:#f3e8d0;color:#0d0d0e}.card{background:#151518;border:1px solid #29292f;border-radius:18px;padding:22px;margin-top:16px}.card h2{margin:0 0 18px;font-size:20px}.formgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}label{font-size:12px;color:#aaa;display:grid;gap:7px}input,select{width:100%;background:#0e0e10;color:#f4f1ea;border:1px solid #38383e;border-radius:10px;padding:12px}.primary{margin-top:16px;width:100%;border:0;background:#f4f1ea;color:#0d0d0e;font-weight:900;border-radius:11px;padding:13px}.muted{color:#666}.tablehead{display:flex;justify-content:space-between;align-items:center}.danger{color:#cf9d9d}table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:12px 8px;border-bottom:1px solid #29292f;text-align:right}th:first-child,td:first-child{text-align:left}th{color:#777;font-weight:600}.total td{border-bottom:0;padding-top:16px;font-weight:900}.total td:nth-child(2),.total td:nth-child(3){font-size:18px}footer{text-align:center;color:#626067;font-size:12px;margin-top:20px}@media(max-width:700px){header{align-items:flex-start;flex-direction:column}.hero{grid-template-columns:1fr 26px 1fr}.scorebox{padding:18px 10px}.formgrid{grid-template-columns:1fr}th,td{padding:10px 5px}}`}</style>
  </main>
}
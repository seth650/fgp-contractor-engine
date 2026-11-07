import { useEffect, useMemo, useState } from "react";
import {
  CATEGORY_VOLUME,
  DASH_KPIS,
  DEFAULT_SERIES_ON,
  LOCATION_YTD,
  MONTHLY_SERIES,
  PERIODS,
  SERIES_META,
  TOP_PRODUCTS,
  TOP_SYSTEMS,
  loadDashPrefs,
  money,
  moneyCompact,
  saveDashPrefs,
} from "./reportingData.js";

function DepthLineChart({ seriesOn }) {
  const width = 720;
  const height = 280;
  const pad = { t: 28, r: 20, b: 36, l: 44 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const months = MONTHLY_SERIES.months;
  const active = SERIES_META.filter((s) => seriesOn[s.id]);

  const maxY = useMemo(() => {
    let m = 1;
    SERIES_META.forEach((s) => {
      if (!seriesOn[s.id]) return;
      MONTHLY_SERIES[s.id].forEach((v) => {
        if (v > m) m = v;
      });
    });
    return m * 1.12;
  }, [seriesOn]);

  function xAt(i) {
    return pad.l + (i / Math.max(months.length - 1, 1)) * innerW;
  }
  function yAt(v) {
    return pad.t + innerH - (v / maxY) * innerH;
  }

  function pathFor(id, offset = 0) {
    return MONTHLY_SERIES[id]
      .map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i) + offset},${yAt(v) + offset}`)
      .join(" ");
  }

  function areaFor(id) {
    const pts = MONTHLY_SERIES[id].map((v, i) => `${xAt(i)},${yAt(v)}`);
    const base = `${xAt(months.length - 1)},${pad.t + innerH} ${xAt(0)},${pad.t + innerH}`;
    return `M${pts.join(" L")} L${base} Z`;
  }

  return (
    <svg className="depth-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Category volume trend">
      <defs>
        <linearGradient id="chartFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d7e0ea" stopOpacity="0.55" />
        </linearGradient>
        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#0e1c3a" floodOpacity="0.18" />
        </filter>
        {SERIES_META.map((s) => (
          <linearGradient key={s.id} id={`fill-${s.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
          </linearGradient>
        ))}
      </defs>

      <rect x={pad.l} y={pad.t} width={innerW} height={innerH} fill="url(#chartFloor)" rx="12" />

      {/* depth plane */}
      <path
        d={`M${pad.l} ${pad.t + innerH} L${pad.l + 18} ${pad.t + innerH - 14} L${pad.l + innerW + 8} ${pad.t + innerH - 14} L${pad.l + innerW} ${pad.t + innerH} Z`}
        fill="rgba(14,28,58,0.06)"
      />

      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = pad.t + innerH * (1 - t);
        return (
          <g key={t}>
            <line x1={pad.l} y1={y} x2={pad.l + innerW} y2={y} stroke="rgba(14,28,58,0.08)" strokeDasharray="4 6" />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" className="chart-axis">
              {Math.round(maxY * t)}
            </text>
          </g>
        );
      })}

      {months.map((m, i) => (
        <text key={m} x={xAt(i)} y={height - 10} textAnchor="middle" className="chart-axis">
          {m}
        </text>
      ))}

      {active.map((s) => (
        <g key={s.id}>
          <path d={areaFor(s.id)} fill={`url(#fill-${s.id})`} />
          {/* shadow twin for faux-3D */}
          <path d={pathFor(s.id, 3)} fill="none" stroke="rgba(14,28,58,0.12)" strokeWidth="4" strokeLinecap="round" />
          <path
            d={pathFor(s.id)}
            fill="none"
            stroke={s.color}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#lineGlow)"
          />
          {MONTHLY_SERIES[s.id].map((v, i) => (
            <g key={`${s.id}-${i}`}>
              <circle cx={xAt(i) + 2} cy={yAt(v) + 3} r="5" fill="rgba(14,28,58,0.12)" />
              <circle cx={xAt(i)} cy={yAt(v)} r="5.5" fill="#fff" stroke={s.color} strokeWidth="2.5" />
              <circle cx={xAt(i)} cy={yAt(v)} r="2" fill={s.color} />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

export default function ReportingDashboard({ view = "network" }) {
  const saved = loadDashPrefs();
  const [period, setPeriod] = useState(saved?.period || "ytd");
  const [seriesOn, setSeriesOn] = useState(saved?.seriesOn || DEFAULT_SERIES_ON);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    saveDashPrefs({ period, seriesOn });
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1200);
    return () => clearTimeout(t);
  }, [period, seriesOn]);

  function toggleSeries(id) {
    setSeriesOn((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const maxLoc = Math.max(...LOCATION_YTD.map((r) => r.amount));

  return (
    <div className="report-dash">
      <div className="report-toolbar">
        <div>
          <div className="kicker tight">Network reporting</div>
          <h2>{view === "products" ? "Products & systems" : view === "locations" ? "Distributors" : "Network overview"}</h2>
          <p className="muted">Year-to-date through Nov 7, 2026.</p>
        </div>
        <div className="report-controls">
          <div className="period-pills" role="tablist" aria-label="Time range">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={period === p.id ? "chip on" : "chip"}
                onClick={() => setPeriod(p.id)}
                title={p.note}
              >
                {p.label}
              </button>
            ))}
          </div>
          <em className={`autosave ${savedFlash ? "on" : ""}`}>{savedFlash ? "Saved" : "Filters remembered"}</em>
        </div>
      </div>

      {(view === "network" || view === "products") && (
        <div className="kpis report-kpis">
          {DASH_KPIS.map((item) => (
            <article key={item.id} className="kpi">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <em>
                {item.note} · {item.delta}
              </em>
            </article>
          ))}
        </div>
      )}

      {(view === "network" || view === "products") && (
        <article className="chart-card">
          <div className="chart-card-head">
            <div>
              <div className="kicker tight">Category volume</div>
              <h3>Liquids · pigments · flake · customs</h3>
              <p className="muted">Toggle lines to focus. Depth shadow + markers for a quick read.</p>
            </div>
            <div className="series-toggles">
              {SERIES_META.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={seriesOn[s.id] ? "series-toggle on" : "series-toggle"}
                  style={{ "--series": s.color }}
                  onClick={() => toggleSeries(s.id)}
                  aria-pressed={seriesOn[s.id]}
                >
                  <i />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <DepthLineChart seriesOn={seriesOn} />
          <p className="hint micro">Wholesale $ thousands · November through the 7th.</p>
        </article>
      )}

      <div className="grid-2 report-grid">
        {(view === "network" || view === "products") && (
          <article>
            <div className="kicker tight">Top products</div>
            <h3>What moved YTD</h3>
            <ul className="rank-list">
              {TOP_PRODUCTS.slice(0, view === "products" ? 10 : 6).map((row, i) => (
                <li key={row.name}>
                  <b>{i + 1}</b>
                  <div>
                    <strong>{row.name}</strong>
                    <span>
                      {row.category}
                      {row.gal ? ` · ${row.gal.toLocaleString()} gal` : ""}
                      {row.lbs ? ` · ${row.lbs.toLocaleString()} lb` : ""}
                      {row.units ? ` · ${row.units.toLocaleString()} units` : ""}
                    </span>
                  </div>
                  <em>
                    {moneyCompact(row.revenue)}
                    <small>+{row.trend}%</small>
                  </em>
                </li>
              ))}
            </ul>
          </article>
        )}

        {(view === "network" || view === "products") && (
          <article>
            <div className="kicker tight">Top flooring systems</div>
            <h3>Including customs</h3>
            <ul className="rank-list systems">
              {TOP_SYSTEMS.map((row, i) => (
                <li key={row.code}>
                  <b>{i + 1}</b>
                  <div>
                    <strong>{row.name}</strong>
                    <span>
                      {row.code} · {row.jobs.toLocaleString()} jobs
                    </span>
                    <div className="share-track" aria-hidden="true">
                      <i style={{ width: `${row.share * 100}%` }} />
                    </div>
                  </div>
                  <em>
                    {moneyCompact(row.revenue)}
                    <small>{Math.round(row.share * 100)}%</small>
                  </em>
                </li>
              ))}
            </ul>
          </article>
        )}

        {(view === "network" || view === "locations") && (
          <article>
            <div className="kicker tight">Volume by category</div>
            <h3>Pigments · liquids · more</h3>
            <ul className="cat-volume">
              {CATEGORY_VOLUME.map((row) => (
                <li key={row.id}>
                  <span className="swatch" style={{ background: row.color }} />
                  <div>
                    <strong>{row.label}</strong>
                    <span>
                      {row.detail} · {row.volumeLabel}
                    </span>
                  </div>
                  <b>{money(row.amount)}</b>
                </li>
              ))}
            </ul>
          </article>
        )}

        {(view === "network" || view === "locations") && (
          <article>
            <div className="kicker tight">Distributors</div>
            <h3>Where orders landed</h3>
            <ul className="bars">
              {LOCATION_YTD.map((row) => (
                <li key={row.name}>
                  <span>{row.name}</span>
                  <div>
                    <i style={{ width: `${(row.amount / maxLoc) * 100}%` }} />
                  </div>
                  <b>{moneyCompact(row.amount)}</b>
                </li>
              ))}
            </ul>
          </article>
        )}
      </div>

      <p className="legal">
        Network view is FloorGuard corporate only — distributors do not see each other’s customers.
      </p>
    </div>
  );
}

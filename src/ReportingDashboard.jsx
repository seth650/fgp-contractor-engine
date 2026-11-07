import { useEffect, useMemo, useState } from "react";
import {
  ANNUAL_REVENUE_TARGET,
  AR_AGING,
  CASH_ROWS,
  CATEGORY_VOLUME,
  CHANNEL_MIX,
  DASH_KPIS,
  DASH_WIDGETS,
  DEFAULT_SERIES_ON,
  DEFAULT_WIDGETS_ON,
  FORECAST_MONTHS,
  LOCATION_YTD,
  MARGIN_STACK,
  MONTHLY_SERIES,
  OPS_METRICS,
  PERIODS,
  PNL_ROWS,
  REVENUE_BRIDGE,
  SERIES_META,
  TOP_PRODUCTS,
  TOP_SYSTEMS,
  YTD_REVENUE,
  loadDashPrefs,
  money,
  moneyCompact,
  moneyM,
  saveDashPrefs,
} from "./reportingData.js";

function DepthLineChart({ seriesOn }) {
  const width = 720;
  const height = 280;
  const pad = { t: 28, r: 20, b: 36, l: 48 };
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

function BridgeBars({ rows }) {
  const max = Math.max(...rows.map((r) => Math.abs(r.value)));
  return (
    <ul className="bridge-list">
      {rows.map((row) => {
        const pct = (Math.abs(row.value) / max) * 100;
        const neg = row.value < 0;
        return (
          <li key={row.label} className={row.total ? "total" : ""}>
            <span>{row.label}</span>
            <div className="bridge-track">
              <i
                className={neg ? "neg" : row.total ? "tot" : "pos"}
                style={{ width: `${pct}%` }}
              />
            </div>
            <b>
              {row.total ? moneyM(row.value) : `${neg ? "−" : "+"}${moneyM(Math.abs(row.value)).slice(1)}`}
            </b>
          </li>
        );
      })}
    </ul>
  );
}

export default function ReportingDashboard({ view = "network" }) {
  const saved = loadDashPrefs();
  const [period, setPeriod] = useState(saved?.period || "ytd");
  const [seriesOn, setSeriesOn] = useState(() => ({ ...DEFAULT_SERIES_ON, ...(saved?.seriesOn || {}) }));
  const [widgetsOn, setWidgetsOn] = useState(() => ({ ...DEFAULT_WIDGETS_ON, ...(saved?.widgetsOn || {}) }));
  const [panelOpen, setPanelOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    saveDashPrefs({ period, seriesOn, widgetsOn });
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1200);
    return () => clearTimeout(t);
  }, [period, seriesOn, widgetsOn]);

  function toggleSeries(id) {
    setSeriesOn((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleWidget(id) {
    setWidgetsOn((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function setGroup(group, on) {
    setWidgetsOn((prev) => {
      const next = { ...prev };
      DASH_WIDGETS.filter((w) => w.group === group).forEach((w) => {
        next[w.id] = on;
      });
      return next;
    });
  }

  const show = (id) => widgetsOn[id] !== false;
  const maxLoc = Math.max(...LOCATION_YTD.map((r) => r.amount));
  const planPct = Math.round((YTD_REVENUE / ANNUAL_REVENUE_TARGET) * 100);
  const groups = [...new Set(DASH_WIDGETS.map((w) => w.group))];

  const viewAllows = (widgetId) => {
    if (view === "products") return ["kpis", "chart", "products", "systems", "categories", "channels"].includes(widgetId);
    if (view === "locations") return ["kpis", "categories", "locations", "channels", "ops"].includes(widgetId);
    return true;
  };

  return (
    <div className="report-dash">
      <div className="report-toolbar">
        <div>
          <div className="kicker tight">CFO network pack</div>
          <h2>
            {view === "products" ? "Products & systems" : view === "locations" ? "Distributors" : "Executive overview"}
          </h2>
          <p className="muted">
            $95M FY plan · YTD {moneyCompact(YTD_REVENUE)} ({planPct}% of year) · as of Nov 7, 2026 · sample, not live ERP
          </p>
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
          <button type="button" className={panelOpen ? "chip on" : "chip"} onClick={() => setPanelOpen((v) => !v)}>
            {panelOpen ? "Hide modules" : "Toggle modules"}
          </button>
          <em className={`autosave ${savedFlash ? "on" : ""}`}>{savedFlash ? "Saved" : "Layout remembered"}</em>
        </div>
      </div>

      {panelOpen && (
        <article className="widget-panel">
          <div className="widget-panel-head">
            <div>
              <div className="kicker tight">Dashboard modules</div>
              <h3>Tick what the board should see</h3>
            </div>
            <div className="widget-panel-actions">
              <button type="button" className="ghost tiny" onClick={() => setWidgetsOn({ ...DEFAULT_WIDGETS_ON })}>
                All on
              </button>
              <button
                type="button"
                className="ghost tiny"
                onClick={() => setWidgetsOn(Object.fromEntries(DASH_WIDGETS.map((w) => [w.id, false])))}
              >
                All off
              </button>
            </div>
          </div>
          <div className="widget-groups">
            {groups.map((group) => (
              <div key={group} className="widget-group">
                <div className="widget-group-head">
                  <strong>{group}</strong>
                  <span>
                    <button type="button" className="linkish" onClick={() => setGroup(group, true)}>
                      On
                    </button>
                    {" · "}
                    <button type="button" className="linkish" onClick={() => setGroup(group, false)}>
                      Off
                    </button>
                  </span>
                </div>
                <div className="widget-checks">
                  {DASH_WIDGETS.filter((w) => w.group === group).map((w) => (
                    <label key={w.id} className={!viewAllows(w.id) ? "dim" : ""}>
                      <input
                        type="checkbox"
                        checked={!!widgetsOn[w.id]}
                        disabled={!viewAllows(w.id)}
                        onChange={() => toggleWidget(w.id)}
                      />
                      <span>{w.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      )}

      {show("kpis") && viewAllows("kpis") && (
        <div className="kpis report-kpis cfo-kpis">
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

      <div className="grid-2 report-grid cfo-grid">
        {show("pnl") && viewAllows("pnl") && (
          <article className="cfo-card wide">
            <div className="kicker tight">Income statement</div>
            <h3>P&L snapshot · $M</h3>
            <table className="pnl-table">
              <thead>
                <tr>
                  <th>Line</th>
                  <th>YTD</th>
                  <th>Prior YTD</th>
                  <th>Plan</th>
                  <th>Δ plan</th>
                </tr>
              </thead>
              <tbody>
                {PNL_ROWS.map((row) => {
                  const vsPlan = +(row.ytd - row.plan).toFixed(1);
                  const expenseLike = row.ytd < 0;
                  const favorable = expenseLike ? vsPlan >= 0 : vsPlan >= 0;
                  return (
                    <tr key={row.id} className={row.bold ? "bold" : ""}>
                      <td className={row.indent ? "indent" : ""}>{row.label}</td>
                      <td>{moneyM(row.ytd)}</td>
                      <td>{moneyM(row.prior)}</td>
                      <td>{moneyM(row.plan)}</td>
                      <td className={Math.abs(vsPlan) < 0.05 ? "" : favorable ? "up" : "down"}>
                        {vsPlan > 0 ? "+" : ""}
                        {moneyM(vsPlan)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </article>
        )}

        {show("cash") && viewAllows("cash") && (
          <article className="cfo-card">
            <div className="kicker tight">Balance sheet pulse</div>
            <h3>Cash & working capital</h3>
            <ul className="cash-list">
              {CASH_ROWS.map((row) => (
                <li key={row.label} className={row.emphasize ? "emphasize" : ""}>
                  <span>{row.label}</span>
                  <b>
                    {row.value < 0 ? "−" : ""}
                    {moneyM(Math.abs(row.value))}
                  </b>
                </li>
              ))}
            </ul>
          </article>
        )}

        {show("bridge") && viewAllows("bridge") && (
          <article className="cfo-card">
            <div className="kicker tight">Variance</div>
            <h3>YoY revenue bridge</h3>
            <BridgeBars rows={REVENUE_BRIDGE} />
          </article>
        )}

        {show("forecast") && viewAllows("forecast") && (
          <article className="cfo-card">
            <div className="kicker tight">Outlook</div>
            <h3>Forecast vs actual · $M</h3>
            <ul className="forecast-list">
              {FORECAST_MONTHS.map((row) => (
                <li key={row.m}>
                  <span>{row.m}</span>
                  <div className="forecast-bars">
                    <i className="plan" style={{ width: `${(row.plan / 15) * 100}%` }} title={`Plan ${row.plan}`} />
                    {row.actual != null && (
                      <i className="act" style={{ width: `${(row.actual / 15) * 100}%` }} title={`Actual ${row.actual}`} />
                    )}
                  </div>
                  <em>
                    {row.actual != null ? (
                      <>
                        {moneyM(row.actual)} <small>/ {moneyM(row.plan)}</small>
                      </>
                    ) : (
                      <>Plan {moneyM(row.plan)}</>
                    )}
                  </em>
                </li>
              ))}
            </ul>
            <p className="hint micro">Nov* = month-to-date through the 7th.</p>
          </article>
        )}

        {show("margins") && viewAllows("margins") && (
          <article className="cfo-card">
            <div className="kicker tight">Profitability</div>
            <h3>Margin stack</h3>
            <ul className="margin-stack">
              {MARGIN_STACK.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <div className="share-track tall">
                    <i style={{ width: `${row.value}%`, background: row.color }} />
                  </div>
                  <b>{row.value.toFixed(1)}%</b>
                </li>
              ))}
            </ul>
          </article>
        )}

        {show("ar") && viewAllows("ar") && (
          <article className="cfo-card">
            <div className="kicker tight">Collections</div>
            <h3>AR aging · $12.8M</h3>
            <ul className="ar-list">
              {AR_AGING.map((row) => (
                <li key={row.bucket}>
                  <span>{row.bucket}</span>
                  <div className="share-track">
                    <i style={{ width: `${row.share * 100}%` }} />
                  </div>
                  <b>{moneyM(row.amount)}</b>
                </li>
              ))}
            </ul>
          </article>
        )}

        {show("ops") && viewAllows("ops") && (
          <article className="cfo-card">
            <div className="kicker tight">Operations</div>
            <h3>Capacity & service</h3>
            <ul className="ops-grid">
              {OPS_METRICS.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                  <em>{row.note}</em>
                </li>
              ))}
            </ul>
          </article>
        )}
      </div>

      {show("chart") && viewAllows("chart") && (
        <article className="chart-card">
          <div className="chart-card-head">
            <div>
              <div className="kicker tight">Category volume</div>
              <h3>Revenue by product family · $k</h3>
              <p className="muted">Toggle series. Depth markers for a quick CFO read.</p>
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
          <p className="hint micro">Wholesale $ thousands · November through the 7th · scales toward $95M FY.</p>
        </article>
      )}

      <div className="grid-2 report-grid">
        {show("products") && viewAllows("products") && (
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

        {show("systems") && viewAllows("systems") && (
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

        {show("categories") && viewAllows("categories") && (
          <article>
            <div className="kicker tight">Volume by category</div>
            <h3>Mix of the $81.2M</h3>
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

        {show("channels") && viewAllows("channels") && (
          <article>
            <div className="kicker tight">Go-to-market</div>
            <h3>Channel mix · $M</h3>
            <ul className="channel-list">
              {CHANNEL_MIX.map((row) => (
                <li key={row.name}>
                  <div>
                    <strong>{row.name}</strong>
                    <span>{Math.round(row.share * 100)}% of YTD · {row.delta}</span>
                    <div className="share-track" aria-hidden="true">
                      <i style={{ width: `${row.share * 100}%` }} />
                    </div>
                  </div>
                  <b>{moneyM(row.amount)}</b>
                </li>
              ))}
            </ul>
          </article>
        )}

        {show("locations") && viewAllows("locations") && (
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
        Corporate CFO view only — sample numbers scaled to a $95M FY assumption. Distributors do not see each other’s
        customers.
      </p>
    </div>
  );
}

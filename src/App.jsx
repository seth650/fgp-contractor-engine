import { useEffect, useMemo, useState } from "react";
import FreeCalculator from "./FreeCalculator.jsx";
import {
  CONTRACTORS,
  LOCATIONS,
  NETWORK,
  ORDER_SPARK,
  ORDER_STATUSES,
  PRODUCTS,
  STORE_ORDERS,
  money,
} from "./data.js";
import "./App.css";

const MODES = [
  { id: "calculator", label: "Contractor", blurb: "Quote FloorGuard systems, see margin, send the material order." },
  { id: "store", label: "Store", blurb: "Orders, pick lists, pickup, and buying tiers for this location." },
  { id: "floorguard", label: "FloorGuard", blurb: "Network sample across locations. Corporate view only — sample figures." },
];

const STORE_NAV = [
  ["orders", "Orders"],
  ["pick", "Pick list"],
  ["people", "Contractors"],
];

const STATUSES = ["All", ...ORDER_STATUSES];

function Spark({ values }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const line = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 28 - ((value - min) / span) * 22;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg className="spark" viewBox="0 0 100 32" aria-hidden="true">
      <path d={line} />
    </svg>
  );
}

function statusTone(status) {
  const key = String(status || "").toUpperCase();
  if (key.startsWith("NEW")) return "new";
  if (key.startsWith("MATERIALS")) return "staged";
  if (key.startsWith("PICKUP")) return "pickup";
  if (key.startsWith("PAID")) return "paid";
  return "new";
}

export default function App() {
  const [mode, setMode] = useState("calculator");
  const [panel, setPanel] = useState("orders");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [toast, setToast] = useState("");
  const [liveOrder, setLiveOrder] = useState(null);
  const [orders, setOrders] = useState(STORE_ORDERS);
  const maxLocation = Math.max(...LOCATIONS.map((row) => row.amount));
  const modeMeta = MODES.find((item) => item.id === mode);

  const displayOrders = useMemo(
    () =>
      orders.map((row) => {
        if (row.id !== "FG-1042" || !liveOrder) return row;
        return {
          ...row,
          contractor: liveOrder.customerName || row.contractor,
          job: liveOrder.jobName || row.job,
          system: liveOrder.results?.system?.code || liveOrder.systemKey || row.system,
          total: liveOrder.results?.totals?.totalTier ?? row.total,
          status: row.status === "PAID" || row.status === "MATERIALS STAGED" || row.status === "PICKUP SCHEDULED"
            ? row.status
            : "NEW ORDER",
          when: "Just now",
          lines: liveOrder.results?.orderLines || null,
        };
      }),
    [orders, liveOrder]
  );

  const storeTotal = displayOrders.reduce((sum, row) => sum + row.total, 0);
  const visibleOrders = displayOrders.filter((row) => {
    const haystack = `${row.id} ${row.contractor} ${row.job} ${row.system}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    const matchesStatus = status === "All" || row.status === status;
    return matchesQuery && matchesStatus;
  });

  const newOrderGroups = useMemo(() => {
    const fresh = displayOrders.filter((row) => row.status === "NEW ORDER");
    const map = new Map();
    fresh.forEach((row) => {
      if (!map.has(row.contractor)) map.set(row.contractor, []);
      map.get(row.contractor).push(row);
    });
    return [...map.entries()].map(([contractor, jobs]) => ({ contractor, jobs }));
  }, [displayOrders]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  function chooseMode(next) {
    setMode(next);
    setPanel(next === "floorguard" ? "network" : "orders");
  }

  function openStoreFromCalculator(payload) {
    setLiveOrder(payload);
    setOrders((prev) =>
      prev.map((row) =>
        row.id === "FG-1042"
          ? {
              ...row,
              status: "NEW ORDER",
              when: "Just now",
              contractor: payload.customerName || row.contractor,
              job: payload.jobName || row.job,
            }
          : row
      )
    );
    setMode("store");
    setPanel(payload?.focusPick ? "pick" : "orders");
    setToast(payload?.focusPick ? "Pick list shows NEW ORDER jobs." : "FG-1042 landed as NEW ORDER.");
  }

  function invoiceAndStage(orderIds) {
    setOrders((prev) =>
      prev.map((row) =>
        orderIds.includes(row.id) ? { ...row, status: "MATERIALS STAGED", when: "Just now" } : row
      )
    );
    setToast(
      `Invoice + mark staged · ${orderIds.join(", ")}. Contractor email/SMS notify via GHL + Twilio (DK) next.`
    );
  }

  return (
    <div className="app">
      <div className="brand-accent" aria-hidden="true" />
      <header className="top">
        <div>
          <div className="brand-row">
            <img
              className="brand-logo"
              src="/brand/fgp-logo-red.png"
              alt="FloorGuard Products"
            />
            <div>
              <div className="eyebrow">Contractor Engine</div>
              <h1>{modeMeta.label}</h1>
            </div>
          </div>
          <p>{modeMeta.blurb}</p>
        </div>
        <div className="roles" role="tablist" aria-label="Choose a view">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={mode === item.id ? "role on" : "role"}
              onClick={() => chooseMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {mode === "calculator" && <FreeCalculator onOpenStore={openStoreFromCalculator} />}

      {mode !== "calculator" && (
        <section className="laptop">
          <aside>
            <div className="mark">
              <img src="/brand/fgp-mark-white.png" alt="FloorGuard Products" className="aside-logo" />
              <strong>{mode === "store" ? "Midwest" : "Network"}</strong>
            </div>
            <nav>
              {(mode === "store" ? STORE_NAV : [["network", "Network"], ["locations", "Locations"], ["products", "Products"]]).map(
                ([id, label]) => (
                  <button key={id} type="button" className={panel === id ? "nav on" : "nav"} onClick={() => setPanel(id)}>
                    {label}
                  </button>
                )
              )}
            </nav>
            <p>
              {mode === "store"
                ? "Store role: this location’s orders only. Buying tiers stay on the contractor account."
                : "FloorGuard corporate sample. One distributor does not see another’s customers."}
            </p>
          </aside>

          <div className="desk">
            {mode === "store" && panel === "orders" && (
              <>
                <div className="desk-head">
                  <div>
                    <div className="kicker">Orders</div>
                    <h2>One inbox for the store</h2>
                    <p className="muted">NEW ORDER → MATERIALS STAGED → PICKUP SCHEDULED → PAID</p>
                  </div>
                  <div className="stat-block">
                    <strong>{money(storeTotal)}</strong>
                    <Spark values={ORDER_SPARK} />
                  </div>
                </div>
                <div className="toolbar">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search contractor, job, or order"
                    aria-label="Search orders"
                  />
                  <div className="filters">
                    {STATUSES.map((name) => (
                      <button key={name} type="button" className={status === name ? "chip on" : "chip"} onClick={() => setStatus(name)}>
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Contractor</th>
                      <th>Job</th>
                      <th>System</th>
                      <th>When</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.map((row) => (
                      <tr key={row.id} className={row.id === "FG-1042" && liveOrder ? "fresh" : ""}>
                        <td>{row.id}</td>
                        <td>{row.contractor}</td>
                        <td>{row.job}</td>
                        <td>{row.system}</td>
                        <td>{row.when}</td>
                        <td>
                          <span className={`pill tone-${statusTone(row.status)}`}>{row.status}</span>
                        </td>
                        <td>{money(row.total)}</td>
                      </tr>
                    ))}
                    {visibleOrders.length === 0 && (
                      <tr>
                        <td colSpan="7" className="empty">
                          No orders match that search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}

            {mode === "store" && panel === "pick" && (
              <>
                <div className="desk-head">
                  <div>
                    <div className="kicker">Pick list</div>
                    <h2>NEW ORDER jobs ready to stage</h2>
                    <p className="muted">Grouped by contractor. Invoice + mark staged notifies them (GHL/Twilio next).</p>
                  </div>
                </div>
                {newOrderGroups.length === 0 && <p className="muted">No NEW ORDER jobs right now.</p>}
                <div className="contractor-cards">
                  {newOrderGroups.map((group) => (
                    <article key={group.contractor} className="contractor-card">
                      <header>
                        <div>
                          <strong>{group.contractor}</strong>
                          <span>{group.jobs.length} job{group.jobs.length === 1 ? "" : "s"} · NEW ORDER</span>
                        </div>
                        <button
                          type="button"
                          className="primary tight"
                          onClick={() => invoiceAndStage(group.jobs.map((j) => j.id))}
                        >
                          Invoice + mark staged
                        </button>
                      </header>
                      <ul className="job-cards">
                        {group.jobs.map((job) => (
                          <li key={job.id}>
                            <div>
                              <strong>
                                {job.id} · {job.job}
                              </strong>
                              <span>
                                {job.system} · {money(job.total)}
                              </span>
                            </div>
                            <button type="button" className="ghost tight" onClick={() => invoiceAndStage([job.id])}>
                              Stage this job
                            </button>
                          </li>
                        ))}
                      </ul>
                      {group.contractor === (liveOrder?.customerName || "Mike Russell") && liveOrder?.results?.orderLines && (
                        <ul className="lines pick-detail">
                          {liveOrder.results.orderLines.map((line, index) => (
                            <li key={`${line.product}-${index}`}>
                              <div>
                                <strong>{line.product}</strong>
                                <span>Bin {["A-12", "C-04", "A-18", "B-02", "D-11"][index % 5]}</span>
                              </div>
                              <b>
                                {line.qty} × {line.kitSize}
                              </b>
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              </>
            )}

            {mode === "store" && panel === "people" && (
              <>
                <div className="kicker">Your contractors</div>
                <h2>Buying tier sits on the account</h2>
                <p className="muted">Distributor sets Bronze / Silver / Gold. Wholesale numbers wait on FloorGuard’s price book.</p>
                <table>
                  <thead>
                    <tr>
                      <th>Contractor</th>
                      <th>Buying tier</th>
                      <th>Open jobs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONTRACTORS.map((row) => (
                      <tr key={row.name}>
                        <td>{row.name}</td>
                        <td>{row.tier}</td>
                        <td>{row.jobs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {mode === "floorguard" && panel === "network" && (
              <>
                <div className="kpis">
                  {NETWORK.map((item) => (
                    <article key={item.label} className="kpi">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <Spark values={item.spark} />
                      <em>{item.note}</em>
                    </article>
                  ))}
                </div>
                <div className="grid-2">
                  <article>
                    <div className="kicker">Orders by location</div>
                    <h2>Where the orders landed</h2>
                    <ul className="bars">
                      {LOCATIONS.map((row) => (
                        <li key={row.name}>
                          <span>{row.name}</span>
                          <div>
                            <i style={{ width: `${(row.amount / maxLocation) * 100}%` }} />
                          </div>
                          <b>{money(row.amount)}</b>
                        </li>
                      ))}
                    </ul>
                  </article>
                  <article>
                    <div className="kicker">Systems in quotes</div>
                    <h2>What contractors are selling</h2>
                    <ul className="lines">
                      {PRODUCTS.map((row) => (
                        <li key={row.name}>
                          <div>
                            <strong>{row.name}</strong>
                            <span>Share of sample quotes</span>
                          </div>
                          <b>{row.share}</b>
                        </li>
                      ))}
                    </ul>
                  </article>
                </div>
                <p className="legal">
                  Corporate admin tools are coming. This view stays FloorGuard-corporate — not one store peeking at another’s customers —
                  unless a written agreement says otherwise.
                </p>
              </>
            )}

            {mode === "floorguard" && panel === "locations" && (
              <article>
                <div className="kicker">Orders by location</div>
                <h2>All sixteen would live here</h2>
                <ul className="bars">
                  {LOCATIONS.map((row) => (
                    <li key={row.name}>
                      <span>{row.name}</span>
                      <div>
                        <i style={{ width: `${(row.amount / maxLocation) * 100}%` }} />
                      </div>
                      <b>{money(row.amount)}</b>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {mode === "floorguard" && panel === "products" && (
              <article>
                <div className="kicker">Systems in quotes</div>
                <h2>Which FloorGuard systems are being sold</h2>
                <ul className="lines">
                  {PRODUCTS.map((row) => (
                    <li key={row.name}>
                      <div>
                        <strong>{row.name}</strong>
                        <span>Share of sample quotes</span>
                      </div>
                      <b>{row.share}</b>
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        </section>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

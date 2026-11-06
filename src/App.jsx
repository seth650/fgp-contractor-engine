import { useEffect, useState } from "react";
import {
  COLORS,
  CONTRACTORS,
  JOB,
  KITS,
  LOCATIONS,
  NETWORK,
  ORDER_SPARK,
  PICK,
  PRODUCTS,
  STORE_ORDERS,
  jobCost,
  margin,
  money,
} from "./data.js";
import "./App.css";

const ROLES = [
  { id: "contractor", label: "Contractor", blurb: "Quote the Floorguard system, see the margin, then send the material order." },
  { id: "store", label: "Store", blurb: "One inbox for approved quotes, pick lists, pickup, and that contractor's price tier." },
  { id: "floorgard", label: "Floorgard", blurb: "Orders and member contractors across locations. These figures are samples from the pitch." },
];

const STORE_NAV = [
  ["orders", "Orders"],
  ["pick", "Pick list"],
  ["people", "Contractors"],
];

const STATUSES = ["All", "Ready to pick", "Approved quote", "Invoiced", "Pickup 4 PM"];

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

function Phone({ caption, children }) {
  return (
    <figure className="device">
      <div className="phone">
        <div className="notch" aria-hidden="true"><i /></div>
        <div className="screen">
          <header className="screen-head">
            <span>Floorguard</span>
            <strong>Products</strong>
          </header>
          <div className="screen-body">{children}</div>
        </div>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export default function App() {
  const [role, setRole] = useState("contractor");
  const [panel, setPanel] = useState("orders");
  const [color, setColor] = useState(COLORS[0]);
  const [quoted, setQuoted] = useState(false);
  const [sent, setSent] = useState(false);
  const [invoiced, setInvoiced] = useState(false);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const profit = margin();
  const maxLocation = Math.max(...LOCATIONS.map((row) => row.amount));
  const roleMeta = ROLES.find((item) => item.id === role);
  const kits = KITS.map((kit) => (
    kit.name === "Decorative flake" ? { ...kit, detail: `${color} blend` } : kit
  ));
  const storeTotal = STORE_ORDERS.reduce((sum, row) => sum + row.total, 0);
  const visibleOrders = STORE_ORDERS.filter((row) => {
    const haystack = `${row.id} ${row.contractor} ${row.job} ${row.system}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    const matchesStatus = status === "All" || row.status === status;
    return matchesQuery && matchesStatus;
  });

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  function chooseRole(next) {
    setRole(next);
    setPanel(next === "floorgard" ? "network" : "orders");
  }

  return (
    <div className="app">
      <header className="top">
        <div>
          <div className="eyebrow">Floorguard Contractor Engine</div>
          <h1>{roleMeta.label}</h1>
          <p>{roleMeta.blurb}</p>
        </div>
        <div className="roles" role="tablist" aria-label="Choose a login">
          {ROLES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={role === item.id ? "role on" : "role"}
              onClick={() => chooseRole(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {role === "contractor" && (
        <section className="studio" aria-label="Contractor phones">
          <Phone caption="System and kit count">
            <div className="kicker">System</div>
            <h2>{JOB.system}</h2>
            <p className="muted">{JOB.place} · {JOB.sqft} sq ft · {JOB.customer}</p>
            <div className="swatches">
              {COLORS.map((name) => (
                <button key={name} type="button" className={color === name ? "swatch on" : "swatch"} onClick={() => setColor(name)}>
                  <i data-color={name} />
                  {name}
                </button>
              ))}
            </div>
            <ul className="lines">
              {kits.map((kit) => (
                <li key={kit.name}>
                  <div>
                    <strong>{kit.name}</strong>
                    <span>{kit.detail}</span>
                  </div>
                  <b>{kit.qty}</b>
                </li>
              ))}
            </ul>
          </Phone>

          <Phone caption="Price and margin">
            <div className="kicker">Customer price</div>
            <div className="price">{money(JOB.price)}</div>
            <p className="muted">{JOB.system} · {color}</p>
            <dl>
              <div><dt>Materials</dt><dd>{money(JOB.materials)}</dd></div>
              <div><dt>Crew, 4 hours</dt><dd>{money(JOB.crew)}</dd></div>
              <div><dt>Consumables</dt><dd>{money(JOB.consumables)}</dd></div>
              <div><dt>Travel</dt><dd>{money(JOB.travel)}</dd></div>
              <div className="total"><dt>Job cost</dt><dd>{money(jobCost())}</dd></div>
            </dl>
            <div className="margin-line">
              <span>Margin</span>
              <strong>{profit.pct.toFixed(2)}%</strong>
              <em>{money(profit.dollars)}</em>
            </div>
            <button
              className="primary"
              type="button"
              onClick={() => {
                setQuoted(true);
                setToast(`Quote of ${money(JOB.price)} is ready for ${JOB.customer}.`);
              }}
            >
              {quoted ? "Quote ready" : `Send quote to ${JOB.customer.split(" ")[0]}`}
            </button>
          </Phone>

          <Phone caption="Material order">
            <div className="kicker">To the store</div>
            <div className="price">{money(JOB.resinOrder)}</div>
            <p className="muted">Floorguard resin and kits for {JOB.place}. This is the part of the {money(JOB.price)} quote that the store fulfills.</p>
            <ul className="lines">
              {kits.map((kit) => (
                <li key={kit.name}>
                  <div><strong>{kit.name}</strong><span>{kit.detail}</span></div>
                  <b>{kit.qty}</b>
                </li>
              ))}
            </ul>
            <button
              className="primary"
              type="button"
              disabled={sent}
              onClick={() => {
                setSent(true);
                setToast("Sent to Floorgard Midwest. It shows in the store inbox as FG-1042.");
              }}
            >
              {sent ? "Sent to Floorgard Midwest" : "Send to Floorgard Midwest"}
            </button>
          </Phone>
        </section>
      )}

      {role !== "contractor" && (
        <section className="laptop">
          <aside>
            <div className="mark">
              <span>Floorguard</span>
              <strong>{role === "store" ? "Midwest" : "Network"}</strong>
            </div>
            <nav>
              {(role === "store" ? STORE_NAV : [["network", "Network"], ["locations", "Locations"], ["products", "Products"]]).map(([id, label]) => (
                <button key={id} type="button" className={panel === id ? "nav on" : "nav"} onClick={() => setPanel(id)}>
                  {label}
                </button>
              ))}
            </nav>
            <p>Sample data. The live ECOS app is unchanged.</p>
          </aside>

          <div className="desk">
            {role === "store" && panel === "orders" && (
              <>
                <div className="desk-head">
                  <div>
                    <div className="kicker">Orders</div>
                    <h2>One inbox for the store</h2>
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
                    <tr><th>Order</th><th>Contractor</th><th>Job</th><th>System</th><th>When</th><th>Status</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {visibleOrders.map((row) => (
                      <tr key={row.id} className={sent && row.id === "FG-1042" ? "fresh" : ""}>
                        <td>{row.id}</td>
                        <td>{row.contractor}</td>
                        <td>{row.job}</td>
                        <td>{row.system}</td>
                        <td>{row.when}</td>
                        <td><span className={`pill tone-${row.status.split(" ")[0].toLowerCase()}`}>{row.status}</span></td>
                        <td>{money(row.total)}</td>
                      </tr>
                    ))}
                    {visibleOrders.length === 0 && (
                      <tr><td colSpan="7" className="empty">No orders match that search.</td></tr>
                    )}
                  </tbody>
                </table>
              </>
            )}

            {role === "store" && panel === "pick" && (
              <div className="grid-2">
                <article>
                  <div className="kicker">Pick list · FG-1042</div>
                  <h2>{JOB.place}</h2>
                  <p className="muted">Pickup today, counter. Built from the approved quote. Flake color: {color}.</p>
                  <ul className="lines">
                    {PICK.map((row) => (
                      <li key={row.item}>
                        <div>
                          <strong>{row.item.includes("Flake") ? `Flake blend — ${color}` : row.item}</strong>
                          <span>Bin {row.bin}</span>
                        </div>
                        <b>{row.qty}</b>
                      </li>
                    ))}
                  </ul>
                </article>
                <article>
                  <div className="kicker">Next</div>
                  <h2>Invoice in one click</h2>
                  <p className="muted">The contractor's buying tier is already on the order. QuickBooks comes later. This button is a preview.</p>
                  <button
                    className="primary"
                    type="button"
                    onClick={() => {
                      setInvoiced(true);
                      setToast(invoiced ? "Invoice preview is still a sample." : "Invoice preview created for FG-1042.");
                    }}
                  >
                    {invoiced ? "Invoice preview ready" : "Create invoice"}
                  </button>
                </article>
              </div>
            )}

            {role === "store" && panel === "people" && (
              <>
                <div className="kicker">Your contractors</div>
                <h2>Buying tier sits on the account</h2>
                <p className="muted">The distributor sets the tier. Wholesale numbers wait until Floorguard confirms the price book.</p>
                <table>
                  <thead><tr><th>Contractor</th><th>Tier</th><th>Open jobs</th></tr></thead>
                  <tbody>
                    {CONTRACTORS.map((row) => (
                      <tr key={row.name}><td>{row.name}</td><td>{row.tier}</td><td>{row.jobs}</td></tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {role === "floorgard" && panel === "network" && (
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
                          <div><i style={{ width: `${(row.amount / maxLocation) * 100}%` }} /></div>
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
                        <li key={row.name}><div><strong>{row.name}</strong><span>Share of sample quotes</span></div><b>{row.share}</b></li>
                      ))}
                    </ul>
                  </article>
                </div>
                <p className="legal">This view is for Floorguard corporate, so one distributor does not see another's customers. The numbers are sample figures from the pitch.</p>
              </>
            )}

            {role === "floorgard" && panel === "locations" && (
              <article>
                <div className="kicker">Orders by location</div>
                <h2>All sixteen would live here</h2>
                <ul className="bars">
                  {LOCATIONS.map((row) => (
                    <li key={row.name}>
                      <span>{row.name}</span>
                      <div><i style={{ width: `${(row.amount / maxLocation) * 100}%` }} /></div>
                      <b>{money(row.amount)}</b>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {role === "floorgard" && panel === "products" && (
              <article>
                <div className="kicker">Systems in quotes</div>
                <h2>Which Floorguard systems are being sold</h2>
                <ul className="lines">
                  {PRODUCTS.map((row) => (
                    <li key={row.name}><div><strong>{row.name}</strong><span>Share of sample quotes</span></div><b>{row.share}</b></li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        </section>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

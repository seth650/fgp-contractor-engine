import { useState } from "react";
import {
  COLORS,
  CONTRACTORS,
  JOB,
  KITS,
  LOCATIONS,
  NETWORK,
  PICK,
  PRODUCTS,
  STORE_ORDERS,
  jobCost,
  margin,
  money,
} from "./data.js";
import "./App.css";

const ROLES = [
  { id: "contractor", label: "The contractor", blurb: "Quotes on Floorguard systems, then sends the material order to their store." },
  { id: "store", label: "The store", blurb: "One way to take orders: approved quotes, pick lists, pickup, and that contractor's price tier." },
  { id: "floorgard", label: "Floorgard", blurb: "Orders and member contractors across locations. Sample figures only." },
];

const NAV = {
  contractor: [
    ["estimate", "Estimate"],
    ["margin", "Price and margin"],
    ["order", "Material order"],
  ],
  store: [
    ["orders", "Orders"],
    ["pick", "Pick list"],
    ["people", "Contractors"],
  ],
  floorgard: [
    ["network", "Network"],
    ["locations", "Locations"],
    ["products", "Products"],
  ],
};

export default function App() {
  const [role, setRole] = useState("contractor");
  const [panel, setPanel] = useState("margin");
  const [color, setColor] = useState(COLORS[0]);
  const profit = margin();
  const maxLocation = Math.max(...LOCATIONS.map((row) => row.amount));

  function chooseRole(next) {
    setRole(next);
    setPanel(NAV[next][0][0]);
  }

  const roleMeta = ROLES.find((item) => item.id === role);

  return (
    <div className="shell">
      <aside className="side">
        <div className="mark">
          <span className="mark-kicker">Floorguard</span>
          <strong>Contractor Engine</strong>
        </div>
        <nav>
          {NAV[role].map(([id, label]) => (
            <button key={id} className={panel === id ? "nav on" : "nav"} onClick={() => setPanel(id)} type="button">
              {label}
            </button>
          ))}
        </nav>
        <p className="side-note">Sample data. The live ECOS app is unchanged.</p>
      </aside>

      <main>
        <header className="top">
          <div>
            <div className="eyebrow">ECOS for Floorguard</div>
            <h1>{roleMeta.label}</h1>
            <p>{roleMeta.blurb}</p>
          </div>
          <div className="roles" role="tablist">
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

        {role === "contractor" && panel === "estimate" && (
          <section className="grid-2">
            <article className="card">
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
            </article>
            <article className="card">
              <div className="kicker">Kit count</div>
              <ul className="lines">
                {KITS.map((kit) => (
                  <li key={kit.name}>
                    <div>
                      <strong>{kit.name}</strong>
                      <span>{kit.detail}</span>
                    </div>
                    <b>{kit.qty}</b>
                  </li>
                ))}
              </ul>
              <p className="muted">Color on this quote: {color}. Coverage rates come from the Floorguard system, the same idea as ECOS kit math.</p>
            </article>
          </section>
        )}

        {role === "contractor" && panel === "margin" && (
          <section className="grid-2">
            <article className="card price-card">
              <div className="kicker">Customer price</div>
              <div className="price">{money(JOB.price)}</div>
              <p className="muted">{JOB.system} · {JOB.customer} · {JOB.sqft} sq ft</p>
              <dl>
                <div><dt>Materials</dt><dd>{money(JOB.materials)}</dd></div>
                <div><dt>Crew, 4 hours</dt><dd>{money(JOB.crew)}</dd></div>
                <div><dt>Consumables</dt><dd>{money(JOB.consumables)}</dd></div>
                <div><dt>Travel</dt><dd>{money(JOB.travel)}</dd></div>
                <div className="total"><dt>Job cost</dt><dd>{money(jobCost())}</dd></div>
              </dl>
            </article>
            <article className="card">
              <div className="kicker">Margin</div>
              <div className="price good">{profit.pct.toFixed(2)}%</div>
              <p className="big-note">{money(profit.dollars)} before the quote goes out.</p>
              <button className="primary" type="button">Send quote to {JOB.customer.split(" ")[0]}</button>
              <button className="ghost" type="button" onClick={() => setPanel("order")}>Material order is {money(JOB.resinOrder)}</button>
            </article>
          </section>
        )}

        {role === "contractor" && panel === "order" && (
          <section className="card narrow">
            <div className="kicker">Material order</div>
            <h2>{money(JOB.resinOrder)}</h2>
            <p className="muted">Floorguard resin and kits for {JOB.place}. This is the part of the {money(JOB.price)} quote that goes to the store.</p>
            <ul className="lines">
              {KITS.map((kit) => (
                <li key={kit.name}><div><strong>{kit.name}</strong><span>{kit.detail}</span></div><b>{kit.qty}</b></li>
              ))}
            </ul>
            <button className="primary" type="button">Send to Floorgard Midwest</button>
          </section>
        )}

        {role === "store" && panel === "orders" && (
          <section className="card">
            <div className="split">
              <div>
                <div className="kicker">Orders</div>
                <h2>One inbox for the store</h2>
              </div>
              <div className="stat">{money(STORE_ORDERS.reduce((sum, row) => sum + row.total, 0))}</div>
            </div>
            <table>
              <thead>
                <tr><th>Order</th><th>Contractor</th><th>Job</th><th>System</th><th>When</th><th>Status</th><th>Total</th></tr>
              </thead>
              <tbody>
                {STORE_ORDERS.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.contractor}</td>
                    <td>{row.job}</td>
                    <td>{row.system}</td>
                    <td>{row.when}</td>
                    <td><span className="pill">{row.status}</span></td>
                    <td>{money(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {role === "store" && panel === "pick" && (
          <section className="grid-2">
            <article className="card">
              <div className="kicker">Pick list · FG-1042</div>
              <h2>{JOB.place}</h2>
              <p className="muted">Pickup today, counter. Built from the approved quote.</p>
              <ul className="lines">
                {PICK.map((row) => (
                  <li key={row.item}><div><strong>{row.item}</strong><span>Bin {row.bin}</span></div><b>{row.qty}</b></li>
                ))}
              </ul>
            </article>
            <article className="card">
              <div className="kicker">Next</div>
              <h2>Invoice in one click</h2>
              <p className="muted">The contractor's buying tier is already on the order. QuickBooks connection comes later. This button is a preview.</p>
              <button className="primary" type="button">Create invoice</button>
            </article>
          </section>
        )}

        {role === "store" && panel === "people" && (
          <section className="card">
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
          </section>
        )}

        {role === "floorgard" && panel === "network" && (
          <section>
            <div className="kpis">
              {NETWORK.map((item) => (
                <article key={item.label} className="card kpi">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <em>{item.note}</em>
                </article>
              ))}
            </div>
            <p className="legal">This view is for Floorguard corporate, not for one distributor to see another's customers. The numbers here are sample figures from the pitch.</p>
          </section>
        )}

        {role === "floorgard" && panel === "locations" && (
          <section className="card">
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
          </section>
        )}

        {role === "floorgard" && panel === "products" && (
          <section className="card">
            <div className="kicker">Systems in quotes</div>
            <h2>Which Floorguard systems are being sold</h2>
            <ul className="lines">
              {PRODUCTS.map((row) => (
                <li key={row.name}><div><strong>{row.name}</strong><span>Share of sample quotes</span></div><b>{row.share}</b></li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

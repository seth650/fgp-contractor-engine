import { useState } from "react";

const PLANS = [
  {
    id: "calculator",
    name: "Calculator",
    price: "$49",
    period: "/mo",
    blurb: "All 8 Floorguard systems, custom systems, and higher PO limits.",
    features: ["All 8 ET systems unlocked", "Custom floor systems", "50 POs / year", "Contractor pricing application"],
    cta: "Upgrade to Calculator",
  },
  {
    id: "estimator",
    name: "Estimator",
    price: "$149",
    period: "/mo",
    blurb: "Customer quotes with brand colors, margin tools, and everything in Calculator.",
    features: ["Professional customer quotes", "Brand colors on docs", "Unlimited POs", "Everything in Calculator"],
    cta: "Upgrade to Estimator",
    popular: true,
  },
];

/**
 * Stripe sandbox upgrade UI. Uses VITE_API_BASE_URL + session when available;
 * otherwise runs a local sandbox unlock so the demo still feels live.
 */
export default function PlansModal({ open, onClose, onSandboxUpgrade, membershipTier = "free" }) {
  const [busy, setBusy] = useState(null);
  const [note, setNote] = useState("");

  if (!open) return null;

  async function startCheckout(product) {
    setBusy(product);
    setNote("");
    const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("fgp_demo_access_token") : null;

    try {
      if (apiBase && token) {
        const res = await fetch(`${apiBase}/api/create-checkout-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product,
            returnOrigin: window.location.origin,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Checkout failed");
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }

      // Local sandbox demo path — looks like a real upgrade for Floorguard walkthroughs.
      await new Promise((r) => setTimeout(r, 700));
      onSandboxUpgrade?.(product === "estimator" ? "tier2" : "tier1");
      setNote(
        apiBase
          ? "Sandbox unlock applied locally. Sign in with a Stripe-wired session to open live Checkout."
          : "Sandbox unlock applied. Wire VITE_API_BASE_URL + session to hit real Stripe Checkout."
      );
      setTimeout(() => onClose?.(), 900);
    } catch (e) {
      setNote(e?.message || "Could not start checkout.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Plans" onClick={onClose}>
      <div className="plans-sheet" onClick={(e) => e.stopPropagation()}>
        <header className="plans-head">
          <div>
            <div className="kicker">Floorguard · Stripe sandbox</div>
            <h2>Unlock more systems</h2>
            <p className="muted">Free includes outdoor flake and indoor residential flake. Upgrade opens the rest.</p>
          </div>
          <button type="button" className="ghost tight" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="plans-grid">
          {PLANS.map((plan) => (
            <article key={plan.id} className={plan.popular ? "plan-card popular" : "plan-card"}>
              {plan.popular ? <span className="plan-badge">Most Popular</span> : null}
              <h3>{plan.name}</h3>
              <div className="plan-price">
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </div>
              <p>{plan.blurb}</p>
              <ul>
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                type="button"
                className="primary"
                disabled={busy != null || membershipTier === (plan.id === "estimator" ? "tier2" : "tier1")}
                onClick={() => startCheckout(plan.id)}
              >
                {busy === plan.id ? "Opening Checkout…" : plan.cta}
              </button>
            </article>
          ))}
        </div>
        {note ? <p className="plans-note">{note}</p> : null}
      </div>
    </div>
  );
}

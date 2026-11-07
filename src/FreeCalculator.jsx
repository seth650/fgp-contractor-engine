import { useEffect, useMemo, useState } from "react";
import PlansModal from "./PlansModal.jsx";
import {
  BASE_COAT_COLOR_OPTIONS,
  BASE_PRODUCT_OPTIONS,
  BUYING_TIERS,
  FINISH_OPTIONS,
  FLAKE_CATEGORIES,
  FREE_UNLOCKED_FINISHES,
  FREE_UNLOCKED_SYSTEMS,
  LOCATION_OPTIONS,
  MAX_FREE_JOBS,
  MEMBERSHIP_TIERS,
  SAFETY_BASE_COLORS,
  STOCKED_COLORS,
  SYSTEMS,
  TOPCOAT_OPTIONS,
  buildJobResults,
  buildVisualStack,
  getAutoBaseCoatFromFlakeColor,
  getFullLocationSystemKeys,
  getRecommendationReason,
  getRecommendedSystem,
  money,
  suggestBaseProductForMoisture,
} from "./systems.js";

function aggregateLines(jobs) {
  const map = new Map();
  jobs.forEach((job) => {
    (job.orderLines || []).forEach((line) => {
      const key = `${line.product}|${line.kitSize}|${line.msrpEa}|${line.tierEa}`;
      if (!map.has(key)) {
        map.set(key, { ...line, qty: 0, lineMsrp: 0, lineTier: 0 });
      }
      const row = map.get(key);
      row.qty += line.qty;
      row.lineMsrp += line.lineMsrp;
      row.lineTier += line.lineTier;
    });
  });
  return [...map.values()];
}

const SPEEDS = [
  { value: "slow", label: "Slow", note: "Hot days" },
  { value: "medium", label: "Medium", note: "Standard" },
  { value: "fast", label: "Fast", note: "Cold days" },
];

const MEMBERSHIP_KEY = "fgp_membership_tier";
const BUYING_KEY = "fgp_buying_tier";

function loadMembership() {
  try {
    return localStorage.getItem(MEMBERSHIP_KEY) || "free";
  } catch {
    return "free";
  }
}

function loadBuyingTier() {
  try {
    return localStorage.getItem(BUYING_KEY) || "bronze";
  } catch {
    return "bronze";
  }
}

function PhoneShell({ title, children, footer }) {
  return (
    <div className="phone-shell">
      <div className="phone-bezel">
        <div className="phone-notch" aria-hidden="true" />
        <div className="phone-screen">
          <header className="phone-brand">
            <img src="/brand/fgp-mark-white.png" alt="FloorGuard Products" className="phone-logo" />
            <strong>FloorGuard</strong>
          </header>
          <div className="phone-scroll">{children}</div>
          {footer ? <div className="phone-footer">{footer}</div> : null}
        </div>
      </div>
      <p className="phone-caption">{title}</p>
    </div>
  );
}

export default function FreeCalculator({ onOpenStore, membershipTier: membershipProp, onMembershipChange }) {
  const [membershipTier, setMembershipTier] = useState(membershipProp || loadMembership);
  const [buyingTier, setBuyingTier] = useState(loadBuyingTier);
  const [answers, setAnswers] = useState({
    location: "exterior",
    finish: "flake",
    moisture: "none",
    cracks: "no",
    color: "Domino",
    baseCoatColor: "Sable Gray",
    baseProduct: "hyperbond",
    topcoatProduct: "aspartic85",
  });
  const [sqFt, setSqFt] = useState("400");
  const [jobName, setJobName] = useState("Two car garage");
  const [customerName, setCustomerName] = useState("Mike Russell");
  const [speed, setSpeed] = useState("slow");
  const [step, setStep] = useState("estimate"); // estimate | price | quote | order | submitted
  const [plansOpen, setPlansOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [toast, setToast] = useState("");
  const [sellPrice, setSellPrice] = useState(5500);
  const [marginGoal, setMarginGoal] = useState(50);
  const [flakeCategory, setFlakeCategory] = useState("quarter");
  const [orderJobs, setOrderJobs] = useState([]);
  const [confirmSafety, setConfirmSafety] = useState(null);
  const [quoteChannel, setQuoteChannel] = useState("text");
  const [depositPercent, setDepositPercent] = useState(50);
  const [customDeposit, setCustomDeposit] = useState("");
  const [workOrderScope, setWorkOrderScope] = useState("");
  const [quotePreviewOpen, setQuotePreviewOpen] = useState(false);

  const isFree = membershipTier === "free";
  const buying = BUYING_TIERS[buyingTier] || BUYING_TIERS.bronze;
  const membership = MEMBERSHIP_TIERS[membershipTier] || MEMBERSHIP_TIERS.free;
  const baseIsPolyurea = (answers.baseProduct || "hyperbond") === "polyurea";
  const activeFlakeCat = FLAKE_CATEGORIES.find((c) => c.id === flakeCategory) || FLAKE_CATEGORIES[0];
  const needsSafetyConfirm = answers.finish === "flake" || answers.finish === "quartz";
  const jobLimit = isFree ? MAX_FREE_JOBS : 50;
  const cartFull = orderJobs.length >= jobLimit;
  const depositModeCustom = depositPercent === "custom";

  useEffect(() => {
    if (membershipProp) setMembershipTier(membershipProp);
  }, [membershipProp]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 3400);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setLightbox(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const systemKey = useMemo(() => getRecommendedSystem(answers), [answers]);
  const system = systemKey ? SYSTEMS[systemKey] : null;
  const systemLocked = Boolean(systemKey) && isFree && !FREE_UNLOCKED_SYSTEMS.has(systemKey);
  const otherIndoor = answers.location === "interior" ? getFullLocationSystemKeys("interior").filter((k) => k !== systemKey) : [];

  const priceSheetKey = buying.legacyKey || "msrp";

  const results = useMemo(() => {
    if (!systemKey || systemLocked) return null;
    return buildJobResults({ systemKey, sqFt, answers, speed, tierKey: priceSheetKey });
  }, [systemKey, systemLocked, sqFt, answers, speed, priceSheetKey]);

  const stack = useMemo(() => (results ? buildVisualStack(results.orderLines, answers) : []), [results, answers]);

  const materials = results?.totals.totalTier || 0;
  const crew = 640;
  const consumables = +(materials * 0.0335).toFixed(2);
  const travel = 103.8;
  const jobCost = +(materials + crew + consumables + travel).toFixed(2);
  const profit = +(sellPrice - jobCost).toFixed(2);
  const marginPct = sellPrice > 0 ? (profit / sellPrice) * 100 : 0;
  const deposit = depositModeCustom
    ? Math.min(sellPrice, Math.max(0, Number(customDeposit) || 0))
    : +((sellPrice * Number(depositPercent)) / 100).toFixed(2);
  const balanceDue = +(sellPrice - deposit).toFixed(2);
  const depositLabel = depositModeCustom ? "Custom" : `${depositPercent}%`;
  const scopeFilled = workOrderScope.trim().length > 0;

  const estimateReady =
    Boolean(systemKey) &&
    !systemLocked &&
    sqFt !== "" &&
    Boolean(answers.moisture) &&
    Boolean(answers.cracks) &&
    Boolean(answers.color) &&
    Boolean(answers.baseCoatColor) &&
    Boolean(answers.baseProduct) &&
    Boolean(answers.topcoatProduct) &&
    (baseIsPolyurea ? Boolean(speed) : true);

  function setMembership(next) {
    setMembershipTier(next);
    try {
      localStorage.setItem(MEMBERSHIP_KEY, next);
    } catch {
      /* ignore */
    }
    onMembershipChange?.(next);
  }

  function answer(key, value) {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "color") {
        const auto = getAutoBaseCoatFromFlakeColor(value);
        if (auto) next.baseCoatColor = auto;
      }
      if (key === "location" && value === "exterior") {
        next.finish = "flake";
        if (!prev.topcoatProduct || prev.topcoatProduct === "dt454_clear") next.topcoatProduct = "aspartic85";
      }
      if (key === "location" && value === "interior") {
        if (!prev.topcoatProduct || prev.topcoatProduct === "aspartic85") next.topcoatProduct = "dt454_clear";
      }
      if (key === "moisture") {
        next.baseProduct = suggestBaseProductForMoisture(value);
      }
      return next;
    });
  }

  function pickBaseCoatColor(colorValue) {
    if (needsSafetyConfirm && SAFETY_BASE_COLORS.has(colorValue) && answers.baseCoatColor !== colorValue) {
      setConfirmSafety(colorValue);
      return;
    }
    answer("baseCoatColor", colorValue);
  }

  function pickFlakeColor(colorValue) {
    const auto = getAutoBaseCoatFromFlakeColor(colorValue);
    setAnswers((prev) => ({
      ...prev,
      color: colorValue,
      baseCoatColor: auto || prev.baseCoatColor,
    }));
  }

  function pickFlakeCategory(catId) {
    const cat = FLAKE_CATEGORIES.find((c) => c.id === catId) || FLAKE_CATEGORIES[0];
    setFlakeCategory(cat.id);
    const first = cat.colors[0];
    if (!first) return;
    const alreadyInCat = cat.colors.some((c) => c.value === answers.color);
    if (!alreadyInCat) {
      pickFlakeColor(first.value);
    }
  }

  function snapshotCurrentJob() {
    if (!results) return null;
    return {
      id: `${Date.now()}`,
      jobName: jobName || "Untitled job",
      customerName: customerName || "Customer",
      systemKey,
      systemCode: results.system.code,
      color: answers.color,
      baseCoatColor: answers.baseCoatColor,
      sqFt: results.totals.sf,
      sellPrice,
      orderLines: results.orderLines,
      totalTier: results.totals.totalTier,
      totalMsrp: results.totals.totalMsrp,
    };
  }

  function addAnotherJob() {
    const snap = snapshotCurrentJob();
    if (!snap) return;
    if (cartFull) {
      setToast(isFree ? `Free plan limit is ${MAX_FREE_JOBS} jobs per order.` : "Job limit reached.");
      return;
    }
    setOrderJobs((prev) => [...prev, snap]);
    setStep("estimate");
    setToast(`Job saved (${orderJobs.length + 1}/${jobLimit}). Start the next job.`);
  }

  function jobsForSubmit() {
    const snap = snapshotCurrentJob();
    if (!snap) return orderJobs;
    return [...orderJobs, snap];
  }

  function setBuying(next) {
    setBuyingTier(next);
    try {
      localStorage.setItem(BUYING_KEY, next);
    } catch {
      /* ignore */
    }
  }

  function openPlans() {
    setPlansOpen(true);
  }

  function pickFinish(value, locked) {
    if (locked && isFree) {
      openPlans();
      return;
    }
    answer("finish", value);
  }

  return (
    <div className="contractor-stage">
      <div className="stage-intro">
        <div>
          <div className="eyebrow">Contractor</div>
          <h1>Quote the FloorGuard system</h1>
          <p>
            Build the system, set price and margin, then send the material order. Free unlocks outdoor and indoor residential flake.
          </p>
        </div>
        <div className="tier-pair">
          <div className="tier-chip membership">
            <span>App membership</span>
            <strong>{membership.label}</strong>
            <em>{membership.blurb} · what you pay Stripe for</em>
          </div>
          <div className="tier-chip buying">
            <span>Store buying tier</span>
            <strong>{buying.label}</strong>
            <em>{buying.blurb} · volume with FloorGuard, not membership</em>
            <div className="buying-picks">
              {Object.entries(BUYING_TIERS).map(([id, tier]) => (
                <button
                  key={id}
                  type="button"
                  className={buyingTier === id ? "chip on" : "chip"}
                  onClick={() => setBuying(id)}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="step-tabs" role="tablist">
        {[
          ["estimate", "1 · System"],
          ["price", "2 · Price"],
          ["quote", "3 · Quote"],
          ["order", "4 · Order"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={step === id || (step === "submitted" && id === "order") ? "step-tab on" : "step-tab"}
            onClick={() => {
              if (id !== "estimate" && !estimateReady) {
                setToast("Finish the system screen first.");
                return;
              }
              if ((id === "quote" || id === "order") && step === "estimate") {
                setToast("Price the job before sending a quote.");
                return;
              }
              setStep(id);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {(step === "estimate" || step === "price" || step === "quote" || step === "order") && (
        <div className="phone-row">
          {step === "estimate" && (
            <PhoneShell
              title="System and visual stack"
              footer={
                <button
                  type="button"
                  className="primary navy"
                  disabled={!estimateReady}
                  onClick={() => {
                    if (!estimateReady) return;
                    const mid = jobCost / (1 - marginGoal / 100);
                    if (Number.isFinite(mid) && mid > 0) setSellPrice(Math.round(mid / 10) * 10);
                    setStep("price");
                  }}
                >
                  Price this job →
                </button>
              }
            >
              <div className="job-head">
                <strong>{customerName || "Customer"}</strong>
                <span>
                  {jobName || "Job"} · {sqFt || "—"} ft² · moisture {answers.moisture || "—"}
                </span>
              </div>

              <div className="field-grid compact">
                <label>
                  Customer
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </label>
                <label>
                  Job
                  <input value={jobName} onChange={(e) => setJobName(e.target.value)} />
                </label>
                <label>
                  Sq ft
                  <input
                    value={sqFt}
                    inputMode="decimal"
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d.]/g, "");
                      const parts = raw.split(".");
                      setSqFt(parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : raw);
                    }}
                  />
                </label>
              </div>

              <div className="kicker">Where is the floor?</div>
              <div className="opt-grid two tight">
                {LOCATION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={answers.location === option.value ? "opt on" : "opt"}
                    onClick={() => answer("location", option.value)}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.sub}</span>
                  </button>
                ))}
              </div>

              <div className="kicker">Finish</div>
              <div className="opt-row wrap">
                {FINISH_OPTIONS.map((option) => {
                  const locked = isFree && option.locked && !FREE_UNLOCKED_FINISHES.has(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`chip ${answers.finish === option.value ? "on" : ""} ${locked ? "locked" : ""}`}
                      onClick={() => pickFinish(option.value, locked)}
                    >
                      {option.label}
                      {locked ? " 🔒" : ""}
                    </button>
                  );
                })}
              </div>

              {system && (
                <article className={systemLocked ? "system-card locked-card" : "system-card"}>
                  <div className="kicker">{systemLocked ? "System locked" : "Recommended system"}</div>
                  <h3>
                    {system.code} · {system.label}
                  </h3>
                  <p className="muted">{systemLocked ? "Upgrade to Calculator to unlock this system." : getRecommendationReason(answers, systemKey)}</p>
                  {systemLocked ? (
                    <button type="button" className="primary" onClick={openPlans}>
                      Unlock with Calculator →
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="cutaway-card"
                        onClick={() =>
                          setLightbox({
                            title: `${system.code} cutaway`,
                            body: `${system.label}\n\n${system.warnings.join("\n")}\n\nTap layers in the stack for product detail.`,
                            cutaway: true,
                            layers: stack,
                          })
                        }
                      >
                        <div className="cutaway-mini" aria-hidden="true">
                          {stack.map((layer) => (
                            <span key={layer.role} style={{ background: layer.hex || "#ccc" }} />
                          ))}
                        </div>
                        <div>
                          <strong>System cutaway</strong>
                          <span>Tap to enlarge the layer preview</span>
                        </div>
                      </button>

                      <div className="visual-stack" aria-label="System layer stack">
                        {stack.map((layer) => (
                          <button
                            key={layer.role}
                            type="button"
                            className={`stack-layer ${layer.role}`}
                            onClick={() =>
                              setLightbox({
                                title: layer.title,
                                body: `${layer.product}\n${layer.kitSize} × ${layer.qty}\nNeeds ${layer.totalNeeded}`,
                                hex: layer.hex,
                              })
                            }
                          >
                            <i style={{ background: layer.hex || "#ccc" }} />
                            <div>
                              <strong>{layer.title}</strong>
                              <span>
                                {layer.product || "—"} · {layer.qty} {layer.kitSize}
                              </span>
                            </div>
                            <b>Zoom</b>
                          </button>
                        ))}
                      </div>

                      <div className="section-block">
                        <div className="kicker tight">Moisture</div>
                        <div className="opt-row">
                          {[
                            ["none", "None"],
                            ["moderate", "Mild"],
                            ["high", "Heavy"],
                          ].map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              className={answers.moisture === value ? "chip on" : "chip"}
                              onClick={() => answer("moisture", value)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <p className="hint micro">
                          Defaults: None → HyperBOND · Mild → HyperBOND Turbo · Heavy → MV2112. You can still override the base below.
                        </p>

                        <div className="kicker tight">Visible cracks</div>
                        <div className="opt-row">
                          {[
                            ["no", "No"],
                            ["yes", "Yes"],
                          ].map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              className={answers.cracks === value ? "chip on" : "chip"}
                              onClick={() => answer("cracks", value)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="section-block">
                        <div className="kicker tight">Base coat selection</div>
                        <div className="opt-row wrap">
                          {BASE_PRODUCT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              className={answers.baseProduct === opt.value ? "chip on" : "chip"}
                              onClick={() => answer("baseProduct", opt.value)}
                              title={opt.note}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {baseIsPolyurea && (
                        <div className="section-block">
                          <div className="kicker tight">Polyurea speed</div>
                          <div className="opt-grid three tight">
                            {SPEEDS.map((item) => (
                              <button
                                key={item.value}
                                type="button"
                                className={speed === item.value ? "opt on" : "opt"}
                                onClick={() => setSpeed(item.value)}
                              >
                                <strong>{item.label}</strong>
                                <span>{item.note}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="section-block">
                        <div className="kicker tight">Topcoat selection</div>
                        <div className="opt-row wrap">
                          {TOPCOAT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              className={answers.topcoatProduct === opt.value ? "chip on" : "chip"}
                              onClick={() => answer("topcoatProduct", opt.value)}
                              title={opt.note}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="section-block flake-block">
                        <div className="kicker tight">Flake category</div>
                        <div className="opt-row wrap">
                          {FLAKE_CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              className={flakeCategory === cat.id ? "chip on" : "chip"}
                              onClick={() => pickFlakeCategory(cat.id)}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        <div className="flake-choice-label">
                          <span>
                            {activeFlakeCat.label}: {answers.color} on {answers.baseCoatColor}
                          </span>
                        </div>
                        <div className="flake-thumbs">
                          {activeFlakeCat.colors.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={answers.color === color.value ? "flake-thumb on" : "flake-thumb"}
                              onClick={() => pickFlakeColor(color.value)}
                              onDoubleClick={() =>
                                setLightbox({
                                  title: color.value,
                                  hex: color.hex,
                                  body: `Auto base coat: ${color.recommendedBase}`,
                                })
                              }
                            >
                              <span className="flake-preview" style={{ background: color.hex }} />
                              <em>{color.value}</em>
                            </button>
                          ))}
                        </div>
                        <p className="hint micro">
                          All {STOCKED_COLORS.length} stocked flake options live in the categories above. Picking a flake auto-sets the recommended base coat color — you can still change it.
                        </p>

                        <div className="kicker tight">Base coat color</div>
                        <div className="base-color-row" role="listbox" aria-label="Base coat color">
                          {BASE_COAT_COLOR_OPTIONS.map((color) => {
                            const selected = answers.baseCoatColor === color.value;
                            return (
                              <div key={color.value} className="base-color-hit">
                                <button
                                  type="button"
                                  role="option"
                                  className={selected ? "base-color-chip on" : "base-color-chip"}
                                  style={{ background: color.hex, color: color.textColor }}
                                  aria-selected={selected}
                                  onClick={() => pickBaseCoatColor(color.value)}
                                >
                                  {color.value}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {answers.location === "interior" && otherIndoor.length > 0 && (
                        <div className="section-block">
                          <div className="kicker tight">Other indoor systems</div>
                          <div className="locked-list">
                            {otherIndoor.map((key) => {
                              const locked = isFree && !FREE_UNLOCKED_SYSTEMS.has(key);
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  className="locked-row"
                                  onClick={() => (locked ? openPlans() : null)}
                                >
                                  <span>
                                    {SYSTEMS[key].code} — {SYSTEMS[key].label}
                                  </span>
                                  <em>{locked ? "Unlock Calculator" : "Available"}</em>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </article>
              )}
            </PhoneShell>
          )}

          {step === "price" && results && (
            <PhoneShell
              title="Price and margin"
              footer={
                <button
                  type="button"
                  className="primary navy"
                  onClick={() => {
                    setStep("quote");
                    setToast(`Quote ready for ${customerName.split(" ")[0] || "customer"}.`);
                  }}
                >
                  Send quote to {customerName.split(" ")[0] || "customer"}
                </button>
              }
            >
              <div className="job-head">
                <strong>Price and margin</strong>
                <span>
                  {customerName} · {jobName}
                </span>
              </div>
              <div className="price-hero">{money(sellPrice)}</div>
              <p className="muted">
                {money(sellPrice / (results.totals.sf || 1))}/ft² · {depositLabel} deposit {money(deposit)}
              </p>

              <label className="slider-block">
                <span>Minimum {marginGoal}% margin goal</span>
                <input
                  type="range"
                  min={30}
                  max={75}
                  value={marginGoal}
                  onChange={(e) => {
                    const g = Number(e.target.value);
                    setMarginGoal(g);
                    const mid = jobCost / (1 - g / 100);
                    if (Number.isFinite(mid) && mid > 0) setSellPrice(Math.round(mid / 10) * 10);
                  }}
                />
              </label>

              <label className="price-edit">
                Customer price
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(Number(e.target.value) || 0)}
                />
              </label>

              <dl className="cost-dl">
                <div>
                  <dt>Job cost</dt>
                  <dd>{money(jobCost)}</dd>
                </div>
                <div>
                  <dt>Profit</dt>
                  <dd>{money(profit)}</dd>
                </div>
                <div className="good">
                  <dt>Margin</dt>
                  <dd>{marginPct.toFixed(1)}%</dd>
                </div>
                <div>
                  <dt>Materials (MSRP)</dt>
                  <dd>{money(materials)}</dd>
                </div>
                <div>
                  <dt>Crew</dt>
                  <dd>{money(crew)}</dd>
                </div>
                <div>
                  <dt>Consumables</dt>
                  <dd>{money(consumables)}</dd>
                </div>
                <div>
                  <dt>Travel</dt>
                  <dd>{money(travel)}</dd>
                </div>
              </dl>
              <button type="button" className="ghost" onClick={() => setStep("estimate")}>
                ← Edit system
              </button>
            </PhoneShell>
          )}

          {step === "quote" && results && (
            <PhoneShell
              title="Customer quote"
              footer={
                <div className="footer-stack">
                  <button
                    type="button"
                    className="primary navy"
                    disabled={!scopeFilled}
                    onClick={() => {
                      if (!scopeFilled) {
                        setToast("Add work order scope — which room(s) at the jobsite?");
                        return;
                      }
                      const first = customerName.split(" ")[0] || "customer";
                      const via =
                        quoteChannel === "email" ? "email" : quoteChannel === "link" ? "share link" : "text";
                      setToast(`Quote sent to ${first} via ${via}.`);
                      setStep("order");
                    }}
                  >
                    Send quote — order materials →
                  </button>
                  <button type="button" className="ghost" onClick={() => setStep("price")}>
                    ← Edit price
                  </button>
                </div>
              }
            >
              <div className="job-head">
                <strong>Build the customer quote</strong>
                <span>
                  {customerName} · {jobName}
                </span>
              </div>

              <div className="section-block">
                <div className="kicker tight">Deposit amount</div>
                <label className="field-select">
                  <span>Deposit</span>
                  <select
                    value={depositModeCustom ? "custom" : String(depositPercent)}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next === "custom") {
                        setDepositPercent("custom");
                        if (!customDeposit) setCustomDeposit(String(Math.round(sellPrice * 0.5)));
                      } else {
                        setDepositPercent(Number(next));
                      }
                    }}
                  >
                    <option value="25">25% · {money(sellPrice * 0.25)}</option>
                    <option value="30">30% · {money(sellPrice * 0.3)}</option>
                    <option value="40">40% · {money(sellPrice * 0.4)}</option>
                    <option value="50">50% · {money(sellPrice * 0.5)}</option>
                    <option value="custom">Custom dollar amount</option>
                  </select>
                </label>
                {depositModeCustom && (
                  <label className="price-edit">
                    Custom deposit ($)
                    <input
                      type="number"
                      min={0}
                      max={sellPrice}
                      value={customDeposit}
                      onChange={(e) => setCustomDeposit(e.target.value)}
                    />
                  </label>
                )}
                <p className="hint micro">
                  Deposit due {money(deposit)} · Balance at completion {money(balanceDue)}
                </p>
              </div>

              <div className="section-block">
                <div className="kicker tight">Work order scope</div>
                <label className="field-note">
                  <span>What room(s) are you doing at the jobsite?</span>
                  <textarea
                    value={workOrderScope}
                    onChange={(e) => setWorkOrderScope(e.target.value)}
                    rows={4}
                    placeholder="e.g. Two-car garage floor, laundry mudroom, and exterior patio landing — exclude basement."
                  />
                </label>
                {!scopeFilled && (
                  <p className="hint micro warn">Required on the quote so the customer and crew know the rooms in scope.</p>
                )}
              </div>

              <div className="section-block">
                <div className="kicker tight">Quote preview</div>
                <button
                  type="button"
                  className="ghost full"
                  onClick={() => {
                    if (!scopeFilled) {
                      setToast("Fill work order scope before generating the preview.");
                      return;
                    }
                    setQuotePreviewOpen(true);
                  }}
                >
                  Generate quote preview
                </button>
                <p className="hint micro">Opens a customer-facing summary you can send by text, email, or link.</p>
              </div>

              <div className="section-block">
                <div className="kicker tight">Send via</div>
                <div className="opt-row">
                  {[
                    ["text", "Text"],
                    ["email", "Email"],
                    ["link", "Copy link"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={quoteChannel === value ? "chip on" : "chip"}
                      onClick={() => setQuoteChannel(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="hint micro">Text and email delivery connect in the next release.</p>
              </div>
            </PhoneShell>
          )}

          {step === "order" && results && (
            <PhoneShell
              title="Material order"
              footer={
                <div className="footer-stack">
                  <button
                    type="button"
                    className="ghost"
                    disabled={cartFull}
                    onClick={addAnotherJob}
                  >
                    {cartFull
                      ? isFree
                        ? `Free limit · ${MAX_FREE_JOBS} jobs`
                        : "Job limit reached"
                      : `Add another job to order (${orderJobs.length + 1}/${jobLimit})`}
                  </button>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      const allJobs = jobsForSubmit();
                      const consolidated = aggregateLines(allJobs);
                      const totalTier = consolidated.reduce((s, l) => s + l.lineTier, 0);
                      setStep("submitted");
                      setToast(
                        allJobs.length > 1
                          ? `Consolidated PO · ${allJobs.length} jobs · ${money(totalTier)}`
                          : "Order ready for FloorGuard Midwest."
                      );
                      onOpenStore?.({
                        results: {
                          ...results,
                          orderLines: consolidated,
                          totals: { ...results.totals, totalTier },
                        },
                        jobName: allJobs.length > 1 ? `${allJobs.length} jobs` : jobName,
                        customerName,
                        color: answers.color,
                        baseCoatColor: answers.baseCoatColor,
                        speed,
                        sellPrice,
                        systemKey,
                        jobs: allJobs,
                      });
                      setOrderJobs([]);
                    }}
                  >
                    Submit order to FloorGuard Midwest
                  </button>
                </div>
              }
            >
              <div className="job-head">
                <strong>Material order</strong>
                <span>
                  {orderJobs.length + 1 === 1
                    ? `1 job · Free max ${MAX_FREE_JOBS}`
                    : `${orderJobs.length + 1} jobs · consolidated PO · Free max ${MAX_FREE_JOBS}`}
                </span>
              </div>
              <div className="store-chip">
                <div>
                  <strong>FloorGuard Products Midwest</strong>
                  <span>
                    Buying {buying.label} · App {membership.label}
                  </span>
                </div>
                <em>{buying.label}</em>
              </div>

              {orderJobs.length > 0 && (
                <div className="section-block">
                  <div className="kicker tight">Jobs already in cart</div>
                  <ul className="order-lines">
                    {orderJobs.map((job) => (
                      <li key={job.id}>
                        <div>
                          <strong>{job.jobName}</strong>
                          <span>
                            {job.systemCode} · {job.color} · {job.sqFt} ft²
                          </span>
                        </div>
                        <b>{money(job.totalTier)}</b>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="kicker tight">This job — broken out</div>
              <p className="hint micro">Gallon kits include a 10% buffer in order qty. Need column shows unbuffered job need.</p>
              <ul className="order-lines">
                {results.orderLines.map((line) => (
                  <li key={`${line.product}-${line.layer}-${line.kitSize}`}>
                    <div>
                      <strong>{line.product}</strong>
                      <span>
                        {line.layer} · {line.kitSize} × {line.qty}
                      </span>
                    </div>
                    <b>{money(line.lineTier)}</b>
                  </li>
                ))}
              </ul>
              <div className="order-total">
                <span>This job</span>
                <strong>{money(results.totals.totalTier)}</strong>
              </div>

              {orderJobs.length > 0 && (
                <>
                  <div className="kicker tight">Consolidated PO — what to order</div>
                  <ul className="order-lines">
                    {aggregateLines([...orderJobs, snapshotCurrentJob()].filter(Boolean)).map((line) => (
                      <li key={`c-${line.product}-${line.kitSize}`}>
                        <div>
                          <strong>{line.product}</strong>
                          <span>
                            {line.kitSize} × {line.qty}
                          </span>
                        </div>
                        <b>{money(line.lineTier)}</b>
                      </li>
                    ))}
                  </ul>
                  <div className="order-total">
                    <span>Contractor pays (consolidated)</span>
                    <strong>
                      {money(
                        aggregateLines([...orderJobs, snapshotCurrentJob()].filter(Boolean)).reduce(
                          (s, l) => s + l.lineTier,
                          0
                        )
                      )}
                    </strong>
                  </div>
                </>
              )}

              <div className="action-row po-actions">
                <button type="button" className="ghost" onClick={() => setStep("price")}>
                  ← Price and margin
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() =>
                    setLightbox({
                      title: "Print / save PO",
                      body: "Print / save opens the purchase order for this material list.",
                    })
                  }
                >
                  Print / save PO
                </button>
              </div>
            </PhoneShell>
          )}
        </div>
      )}

      {step === "submitted" && results && (
        <section className="submitted-card">
          <div className="kicker">Order understood</div>
          <h2>Sent to FloorGuard Midwest</h2>
          <p className="muted">
            {customerName} · {jobName} · {results.system.code} · {answers.color} on {answers.baseCoatColor} · {results.totals.sf}{" "}
            ft²
          </p>
          <div className="submitted-stats">
            <div>
              <span>Materials</span>
              <strong>{money(results.totals.totalTier)}</strong>
            </div>
            <div>
              <span>Customer quote</span>
              <strong>{money(sellPrice)}</strong>
            </div>
            <div>
              <span>Deposit ({depositLabel})</span>
              <strong>{money(deposit)}</strong>
            </div>
          </div>
          {scopeFilled && (
            <p className="hint">
              <strong>Work order scope:</strong> {workOrderScope.trim()}
            </p>
          )}
          <p className="hint">Contractor pays materials at MSRP until a buying tier is assigned. Buffer is in the kit quantities above.</p>
          <div className="action-row">
            <button type="button" className="ghost" onClick={() => setStep("estimate")}>
              New job
            </button>
            <button
              type="button"
              className="primary navy"
              onClick={() =>
                onOpenStore?.({
                  results,
                  jobName,
                  customerName,
                  color: answers.color,
                  baseCoatColor: answers.baseCoatColor,
                  speed,
                  sellPrice,
                  systemKey,
                  focusPick: true,
                })
              }
            >
              Open store pick list →
            </button>
          </div>
        </section>
      )}

      <PlansModal
        open={plansOpen}
        onClose={() => setPlansOpen(false)}
        membershipTier={membershipTier}
        onSandboxUpgrade={(tier) => {
          setMembership(tier);
          setToast(tier === "tier2" ? "Estimator unlocked." : "Calculator unlocked — all 8 systems open.");
        }}
      />

      {quotePreviewOpen && results && (
        <div className="lightbox" onClick={() => setQuotePreviewOpen(false)} role="dialog" aria-modal="true">
          <div className="lightbox-card quote-doc branded" onClick={(e) => e.stopPropagation()}>
            <div className="quote-doc-accent" aria-hidden="true" />
            <div className="quote-doc-brandbar">
              <img src="/brand/fgp-logo-red.png" alt="FloorGuard Products" className="quote-doc-logo" />
              <div>
                <span>FloorGuard Products</span>
                <strong>Project quote</strong>
              </div>
            </div>

            <div className="quote-doc-head">
              <div>
                <span>Prepared for</span>
                <h3>{customerName}</h3>
                <p className="muted">
                  {jobName} · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <strong className="quote-doc-total">{money(sellPrice)}</strong>
            </div>

            <div className="quote-finish-strip">
              <div className="quote-swatch" style={{ background: STOCKED_COLORS.find((c) => c.value === answers.color)?.hex || "#888" }} />
              <div className="quote-swatch base" style={{ background: BASE_COAT_COLOR_OPTIONS.find((c) => c.value === answers.baseCoatColor)?.hex || "#ccc" }} />
              <div>
                <strong>
                  {answers.color} on {answers.baseCoatColor}
                </strong>
                <span>
                  {results.system.code} · {results.system.label || "Flake system"} · {results.totals.sf} ft²
                </span>
              </div>
            </div>

            <div className="quote-doc-grid">
              <div>
                <span>Investment</span>
                <strong>{money(sellPrice)}</strong>
              </div>
              <div>
                <span>Per ft²</span>
                <strong>{money(sellPrice / (results.totals.sf || 1))}</strong>
              </div>
              <div>
                <span>Deposit ({depositLabel})</span>
                <strong>{money(deposit)}</strong>
              </div>
              <div>
                <span>Balance at completion</span>
                <strong>{money(balanceDue)}</strong>
              </div>
            </div>

            <div className="quote-doc-scope">
              <span>Work order scope</span>
              <p>{workOrderScope.trim() || "— add rooms on the quote screen —"}</p>
            </div>

            <p className="hint micro">Customer-facing PDF export comes next.</p>
            <div className="action-row">
              <button type="button" className="ghost" onClick={() => setQuotePreviewOpen(false)}>
                Close preview
              </button>
              <button
                type="button"
                className="primary"
                disabled={!scopeFilled}
                onClick={() => {
                  setQuotePreviewOpen(false);
                  const first = customerName.split(" ")[0] || "customer";
                  setToast(`Quote sent to ${first} via ${quoteChannel}.`);
                  setStep("order");
                }}
              >
                Send & order materials →
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmSafety && (
        <div className="lightbox" role="dialog" aria-modal="true">
          <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            <h3>Use {confirmSafety} on this flake floor?</h3>
            <p className="muted">
              Safety Yellow / Safety Red / Ford Blue ask for confirmation on flake (and quartz) floors. Solid color floors will not.
            </p>
            <div className="action-row">
              <button type="button" className="ghost" onClick={() => setConfirmSafety(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="primary navy"
                onClick={() => {
                  answer("baseCoatColor", confirmSafety);
                  setConfirmSafety(null);
                }}
              >
                Yes, use {confirmSafety}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            {lightbox.cutaway && Array.isArray(lightbox.layers) ? (
              <div className="cutaway-large" aria-hidden="true">
                {lightbox.layers.map((layer) => (
                  <div key={layer.role} className="cutaway-large-row">
                    <i style={{ background: layer.hex || "#ccc" }} />
                    <div>
                      <strong>{layer.title}</strong>
                      <span>{layer.product || "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {lightbox.hex && !lightbox.cutaway ? <div className="lightbox-swatch" style={{ background: lightbox.hex }} /> : null}
            <h3>{lightbox.title}</h3>
            <pre>{lightbox.body}</pre>
            <button type="button" className="primary navy" onClick={() => setLightbox(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

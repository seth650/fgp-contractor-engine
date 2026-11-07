# Floorguard Contractor Engine

Floorguard-branded MVP next to the live ECOS app. **ECOS was not changed.**

## Run

```
npm install
npm run dev
```

Open the Vite URL (usually http://127.0.0.1:5173).

## What’s in this MVP

### Contractor (Free)
- Pitch-style phone flow: **visual stack → price/margin → material order**
- Unlocked systems: outdoor flake (`FLK-OD-RES`) and indoor residential flake (`FLK-ID-RES`)
- Moisture under the stack updates the base layer live; base coat and flake are selectable
- Kit math matches ECOS (including **1.10 gallon buffer** on order qty)
- Locked systems/finishes open **Plans** with Stripe sandbox upgrade UI

### Store / Floorgard
- Sample Midwest inbox, pick list from the live quote, contractor tiers
- Corporate network sample with legal note (no cross-distributor customer snooping)

### Stripe sandbox
- Set `VITE_API_BASE_URL` to your sandbox API host and provide a demo access token (`fgp_demo_access_token`) to hit real Checkout
- Without that, Upgrade still applies a **local sandbox unlock** so demos keep moving

## Next wave
- Floorguard-branded quote/invoice screens (ServiceM8-inspired fields, not clones)
- Brand Settings: logo + 2 dominant colors on those docs

## Not yet
- Production deploy / epoxyquoting.com switch
- Full Estimator crew-days production path
- GHL / QBO / Floorguard University

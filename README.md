# Floorguard Contractor Engine

A separate preview of the Floorguard version of ECOS. The live ECOS app in the `ECOS` folder was not changed, and this project is not deployed.

Open it locally:

```
npm install
npm run dev
```

The screen has three roles, matching the pitch: **The contractor**, **The store**, and **Floorgard**. Numbers are sample data from that pitch, not store records.

## What this is

The visual backbone for a Floorguard-branded product: quotes on Floorguard systems, price and margin before the quote goes out, a material order sent to the contractor's store, a store inbox with a pick list, and a corporate network view.

## What this is not yet

- It does not replace the live ECOS calculator. Kit math, membership, and Stripe stay in ECOS until we port them on purpose.
- Wholesale prices are not in here. Those wait on the price book Floorguard agrees to.
- GoHighLevel, QuickBooks, websites, and Floorguard University are not connected. Those are later doors, not part of this preview.
- The brand guide asks for Geist and Bertioga Sans. This preview uses Inter until those font files are added.

## Corporate view

The Floorgard role is meant for Floorguard itself, so they can see orders and systems across their locations. It should not let one distributor, or Dynasty, see another distributor's customers unless Floorguard's agreement says so. This preview uses sample figures only.

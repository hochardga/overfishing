# Definitely Not Overfishing: First-session design sheet

Below is a **first-session design sheet** for the fishing game, tuned for a **normal first run lasting 75–90 minutes** with no prestige bonuses.

I’m assuming the game’s tone arc is:

**cozy pier fishing \-\> small-boat hustle \-\> harbor business \-\> seafood company \-\> “sustainable” extraction machine**

---

# **First-session goal**

By the end of the first 75–90 minutes, the player should have:

* gone from **manual fishing** to **semi-idle operations**  
* started making **real management decisions** about fuel, storage, labor, and processing  
* unlocked **light tycoon play** through boats, facilities, and contracts  
* seen the first serious dark turn: **stocks falling, bycatch rising, the ocean becoming a business input**  
* reached the first prestige/reset: **License Renewal**

---

# **Core structure**

Each phase adds **one new management problem**.

| Phase | Target time | Player role | New tension |
| ----- | ----- | ----- | ----- |
| 1\. Quiet Pier | 0–10 min | solo fisher | catch efficiently |
| 2\. Skiff Operator | 10–20 min | boat owner | fuel vs hold space |
| 3\. Dockside Gear | 20–35 min | small operator | passive gear vs dock capacity |
| 4\. Fleet Ops | 35–55 min | fleet manager | wages, maintenance, routing |
| 5\. Processing & Contracts | 55–75 min | seafood business owner | conversion chains and bottlenecks |
| 6\. Regional Extraction | 75–90 min | industry executive | depletion, bycatch, trust, ocean damage |

---

# **Global rules**

These rules apply across the whole first run.

## **Starting state**

* **Cash:** $0  
* **Pier Cove stock:** 60 / 60  
* **Cast Line cooldown:** 2.2 sec  
* **Normal catch:** 1 fish  
* **Perfect catch:** 2 fish  
* **Base sale price at pier:** $3 per fish  
* **Pier Cove regen:** \+0.40 stock/sec up to cap  
* **Manual fishing remains available all game**, but after Phase 3 it becomes a bonus activity instead of the main economy

## **Stock modifier**

All fishing regions use the same stock-pressure rule once regions become visible.

| Regional stock | Catch-speed modifier |
| ----- | ----- |
| 71–100% | x1.00 |
| 41–70% | x0.85 |
| 21–40% | x0.60 |
| 0–20% | x0.30 |

## **Scarcity pricing**

This is the satire engine.

| Regional stock | Sale-price modifier |
| ----- | ----- |
| 31–100% | x1.00 |
| 11–30% | x1.25 |
| 0–10% | x1.60 |

So the business gets rewarded for finishing off a collapsing fishery.

---

# **Phase 1 — Quiet Pier**

## **Target window**

**0–10 minutes**

## **Fantasy**

A friendly, peaceful fishing game on a wooden dock.

## **Visible resources**

* **Cash**  
* **Fish Nearby** (Pier Cove stock)

## **Core loop**

**Cast \-\> catch \-\> auto-sell \-\> buy hand-gear upgrades**

## **Exact systems**

* Player uses **Cast Line**  
* Each successful cast catches **1 fish**  
* Perfect timing catches **2 fish**  
* Fish are sold immediately for **$3 each**  
* Pier stock slowly refills, so the player is never hard-stalled, but overfishing the dock noticeably reduces pace

## **Starting shop**

| Upgrade | Cost | Effect |
| ----- | ----- | ----- |
| Better Bait | $15 | Perfect zone becomes 10% wider |
| Hand Reel | $35 | Cast cooldown 2.2 sec \-\> 1.9 sec |
| Tackle Tin | $60 | Fish sell price \+$1 |
| Lucky Hat | $90 | Perfect catch becomes 3 fish instead of 2 |
| Salted Lunch | $140 | Manual catch value \+15% |

## **Unlock moment**

**Phase 2 unlocks at 60 lifetime fish landed and $250 lifetime revenue**  
Expected timing: **8–12 minutes**

## **Tone note**

Everything is warm and local. Upgrades are cozy and handmade. The player still feels connected to individual fish.

---

# **Phase 2 — Skiff Operator**

## **Target window**

**10–20 minutes**

## **Fantasy**

You buy a tiny boat and start doing short fishing trips.

## **Visible resources**

* **Cash**  
* **Fuel**  
* **Hold Space**

## **New systems introduced**

* **Boat trips**  
* **Fuel management**  
* **Storage/hold capacity**  
* **Second region: Kelp Bed**

## **Exact unlock package**

When Phase 2 begins, the shop adds:

| Upgrade | Cost | Effect |
| ----- | ----- | ----- |
| Harbor Map | $100 | Unlocks Kelp Bed |
| Rusty Skiff | $300 | Unlocks boat trips |
| Outboard Motor | $180 | Fuel cap 20 \-\> 30 |
| Ice Chest | $150 | Hold cap 15 \-\> 25 |
| Rod Rack | $220 | Manual boat fishing \+20% catch speed |

## **Boat rules**

### **Rusty Skiff base stats**

* **Fuel cap:** 20  
* **Hold cap:** 15  
* **Round trip to Kelp Bed:** 6 fuel  
* **Manual catch rate in Kelp Bed:** equivalent of **0.80 fish/sec** with average play  
* **Kelp Bed base fish value:** $5 each  
* **Kelp Bed stock:** 140 / 140  
* **Kelp Bed regen:** \+0.25 stock/sec

## **New loop**

**Leave dock \-\> fish until hold is near full or fuel is low \-\> return \-\> sell \-\> refuel \-\> upgrade**

## **Tension**

The player now makes real choices:

* bigger hold first, or more fuel  
* short safe trips, or longer more profitable trips  
* keep active fishing at the pier, or commit to boat trips

## **Unlock moment**

**Phase 3 unlocks at:**

* Rusty Skiff purchased  
* **150 lifetime fish landed**  
* **$750 lifetime revenue**

Expected timing: **18–25 minutes**

## **Tone note**

Still friendly. The game still feels personal, but the player has started to think in terms of “a trip” rather than “a fish.”

---

# **Phase 3 — Dockside Gear**

## **Target window**

**20–35 minutes**

## **Fantasy**

The player is no longer just fishing. They are starting to run a small operation.

## **Visible resources**

* **Cash**  
* **Fuel**  
* **Dock Storage**

## **New systems introduced**

* **Passive gear**  
* **Dock storage cap**  
* **Automatic hauling helper**  
* **First real active/idle blend**

## **Exact systems**

Passive gear produces catch while the player does other things, but that catch must go somewhere.

### **Base dock rules**

* **Dock storage cap:** 20 raw fish  
* If dock storage is full, passive gear pauses  
* Raw fish sitting in dock storage loses **10% value every 60 sec**  
* Manual trip returns can also overflow dock storage if the player scales too fast

## **New gear and upgrades**

| Upgrade | Cost | Effect |
| ----- | ----- | ----- |
| Dock Crates | $250 | Dock storage \+20 |
| Fuel Drum | $220 | Fuel cap \+20 |
| Crab Pot | $300 | Uses 1 gear slot, produces 0.18 fish/sec |
| Longline | $450 | Uses 1 gear slot, produces 0.30 fish/sec |
| Dock Cleats | $280 | Gear slots 2 \-\> 3 |
| Hire Cousin | $550 | Auto-hauls passive gear every 90 sec |

### **Starting passive gear rules**

* **Gear slots:** 2  
* **Crab Pot output:** 0.18 fish/sec  
* **Longline output:** 0.30 fish/sec  
* **Passive gear output goes to dock storage**  
* Without Hire Cousin, the player must manually collect each passive gear every 120 sec or it stops producing

## **New loop**

**Fish actively \-\> set gear \-\> collect passive catch \-\> avoid storage cap \-\> sell and refuel**

## **Tension**

The player now balances:

* more passive gear vs more storage  
* more output vs more micromanagement  
* active fishing vs tending the dock

## **Unlock moment**

**Phase 4 unlocks at:**

* **400 lifetime fish landed**  
* **$2,000 lifetime revenue**  
* either **2 passive gear owned** or **Hire Cousin owned**

Expected timing: **32–40 minutes**

## **Tone note**

Still not openly dark, but the game is now about “output.” Fish begin to feel less personal.

---

# **Phase 4 — Fleet Operations**

## **Target window**

**35–55 minutes**

## **Fantasy**

The player becomes a small harbor business owner.

## **Visible resources**

* **Cash**  
* **Fuel**  
* **Fleet Maintenance**

## **New systems introduced**

* **Second boat**  
* **Deckhands**  
* **Automatic fishing routes**  
* **Maintenance decay**  
* **Third region: Offshore Shelf**

## **Exact unlock package**

| Upgrade | Cost | Effect |
| ----- | ----- | ----- |
| Dock Lease | $900 | Unlocks Fleet tab, \+1 boat slot |
| Used Work Skiff | $1,200 | Second boat |
| Hire Deckhand | $700 | Assign to one boat; wages $15/min |
| Repair Shed | $650 | Maintenance decay 30% slower |
| Fish Finder | $850 | All boat catch speed \+20% |
| Offshore Charts | $600 | Unlocks Offshore Shelf |

## **Fleet rules**

### **Boat 1: Rusty Skiff**

* Can still be controlled manually  
* If automated with a deckhand:  
  * **Nearshore auto rate:** 0.45 fish/sec  
  * **Kelp Bed auto rate:** 0.60 fish/sec

### **Boat 2: Work Skiff**

* **Hold cap:** 25  
* **Fuel cap:** 30  
* **Kelp Bed auto rate:** 0.65 fish/sec  
* **Offshore Shelf auto rate:** 0.85 fish/sec

### **Maintenance rules**

* Automated boats lose **1% maintenance every 30 sec**  
* Manually used boats lose **1% every 90 sec**  
* Below **60% maintenance:** catch speed \-20%  
* Below **30% maintenance:** 5% chance per minute of breakdown  
* Breakdown penalty: boat offline for 45 sec and instant repair cost of **$120**  
* Manual repair action: restore 20% maintenance for **$40** and 5 sec time

### **Wages and fuel**

* **Deckhand wage:** $15/min  
* **Fuel refill price:** $2 per unit

### **Offshore Shelf region**

* **Stock:** 320 / 320  
* **Regen:** \+0.18 stock/sec  
* **Base value:** $7 per fish  
* **Round trip fuel cost:** 10

## **New loop**

**Assign boats \-\> buy fuel \-\> keep maintenance up \-\> choose region \-\> collect catch \-\> reinvest**

## **Tension**

This is the first true tycoon turn:

* automation is strong, but no longer free  
* more boats means more money and more overhead  
* routing matters  
* maintenance matters  
* the player starts thinking in throughput instead of catches

## **Unlock moment**

**Phase 5 unlocks at:**

* **2 boats owned**  
* **$5,000 lifetime revenue**  
* **900 lifetime fish landed**

Expected timing: **52–65 minutes**

## **Tone note**

The language shifts. Upgrades sound less handmade and more operational. Fish are becoming inventory.

---

# **Phase 5 — Processing and Contracts**

## **Target window**

**55–75 minutes**

## **Fantasy**

The player is no longer selling fish. They are converting marine biomass into product.

## **Visible resources**

* **Cash**  
* **Cold Storage**  
* **Contract Progress**

## **New systems introduced**

* **Processing chains**  
* **Unloading bottlenecks**  
* **Contracts**  
* **Product conversion**  
* **Light logistics management**

## **Base processing rules**

At the start of Phase 5:

* **Dock unload speed:** 10 raw fish/sec  
* **Cold storage cap:** 40 raw fish  
* Raw fish in cold storage do **not** decay  
* If both dock and cold storage are full, boats stop unloading and idle

## **New facilities**

| Upgrade | Cost | Effect |
| ----- | ----- | ----- |
| Processing Shed | $1,500 | Unlocks Processing tab |
| Flash Freezer | $1,200 | 5 raw fish \-\> 1 Frozen Crate every 10 sec |
| Cannery Line | $2,000 | 8 raw fish \-\> 1 Canned Case every 30 sec |
| Dock Forklift | $800 | Unload lanes 1 \-\> 2 |
| Cold Room Expansion | $900 | Cold storage \+40 |
| Contract Board | $400 | Unlocks timed contracts |

## **Product values**

| Product | Input | Output value |
| ----- | ----- | ----- |
| Raw fish sale | 1 raw fish | $8 |
| Frozen Crate | 5 raw fish | $50 |
| Canned Case | 8 raw fish | $90 |

This makes processing better than raw sale, but only if the player can support the bottlenecks.

## **First contracts**

| Contract | Requirement | Reward |
| ----- | ----- | ----- |
| Local Restaurant Deal | 6 Frozen Crates in 6 min | $450 |
| Budget Grocer Order | 10 Frozen Crates in 7 min | $650 |
| School Lunch Tender | 8 Canned Cases in 8 min | $1,000 |

## **New loop**

**Land catch \-\> unload \-\> decide raw vs frozen vs canned \-\> hit timed contracts \-\> expand facilities**

## **Tension**

This is the core tycoon layer:

* catch is no longer the only bottleneck  
* unloading can jam  
* storage can jam  
* processing can jam  
* contracts force prioritization

## **Unlock moment**

**Phase 6 unlocks at:**

* **2 contracts completed**  
* **1,500 lifetime fish landed**  
* any region reduced below **70% stock**

Expected timing: **72–82 minutes**

## **Tone note**

This is the point where the game stops feeling like fishing and starts feeling like a seafood company. That is intentional.

---

# **Phase 6 — Regional Extraction**

## **Target window**

**75–90 minutes**

## **Fantasy**

The player starts acting like an industry executive managing extraction across marine regions.

## **Visible resources**

* **Cash**  
* **Trust / Influence**  
* **Ocean Health**

Regional stocks move into a separate **Regions** tab.

## **New systems introduced**

* **Visible regional stock bars**  
* **Bycatch**  
* **Habitat damage**  
* **Trust**  
* **Influence**  
* **Ocean Health**  
* **Dark industrial upgrades**

This is the phase where the satire becomes explicit.

---

## **Regions tab**

### **Starting visible regions**

| Region | Stock cap | Regen rate | Base value | Travel profile |
| ----- | ----- | ----- | ----- | ----- |
| Pier Cove | 120 | 1.2% of cap/min | $4 | free / local |
| Kelp Bed | 280 | 0.9% of cap/min | $6 | cheap / safe |
| Offshore Shelf | 650 | 0.6% of cap/min | $8 | expensive / lucrative |

### **Optional late-session region**

| Region | Stock cap | Regen rate | Base value | Unlock |
| ----- | ----- | ----- | ----- | ----- |
| Deep Bank | 900 | 0.4% of cap/min | $9 | permit only |

---

## **Bycatch rules**

Bycatch is introduced with industrial gear.

| Source | Bycatch rate |
| ----- | ----- |
| Manual fishing | 0% |
| Longline | 3% |
| Auto skiff in Offshore Shelf | 6% |
| Bottom Trawl | 18% |

### **Bycatch handling**

At Phase 6 start, bycatch can only be:

* **discarded**  
* or **held in storage** until Fishmeal is unlocked

### **Trust penalty**

* Every **20 bycatch discarded**: **\-5 Trust**  
* If any region drops below **20% stock**: **\-5 Trust**  
* If two regions are below **40% stock** at once: **\-10 Trust**

### **Trust thresholds**

| Trust | Effect |
| ----- | ----- |
| 80–100 | no penalty |
| 60–79 | contract payouts \-10% |
| 40–59 | permit and upkeep costs \+20% |
| 0–39 | new region expansion locked |

---

## **Habitat damage rules**

Only industrial gear damages habitat.

| Source | Habitat damage |
| ----- | ----- |
| Standard auto fishing | 0 |
| Bottom Trawl | \+1 habitat damage per 25 fish landed |
| Deep Bank Permit route | \+1 habitat damage per 40 fish landed |

### **Habitat penalty**

For every **10 habitat damage** in a region:

* that region’s regeneration is reduced by **5% for the current run**

This is the first system that feels hard to undo.

---

## **Ocean Health reveal**

Ocean Health is hidden until one of these happens:

* a region falls below **40% stock**  
* **30 bycatch** has been discarded  
* player buys **Bottom Trawl**

When revealed:

* **Ocean Health starts at 100**

### **Ocean Health loss**

| Cause | Ocean Health loss |
| ----- | ----- |
| Every 100 fish landed after reveal | \-1 |
| Every 20 bycatch discarded | \-2 |
| Every 10 habitat damage | \-3 |

### **Ocean Health thresholds**

| Ocean Health | Effect |
| ----- | ----- |
| 80–100 | no global effect |
| 60–79 | all region regen \-5% |
| 40–59 | all region regen \-15%, storm events begin |
| 0–39 | contracts are rarer, public pressure spikes |

A normal first run should end around **70–80 Ocean Health**. The player should feel the slope, not full apocalypse yet.

---

## **Phase 6 upgrades**

| Upgrade | Cost | Effect |
| ----- | ----- | ----- |
| Bottom Trawl | $2,400 | Boat catch \+50%, bycatch 18%, habitat damage enabled |
| Fishmeal Line | $1,800 | 10 bycatch \-\> 1 Meal Sack worth $70 |
| Sustainability Campaign | $1,500 | \+10 Trust immediately |
| Fisheries Association | $2,200 | \+15 Influence, permit costs \-25% |
| Sonar Sweep | $2,800 | Boats auto-route to highest-stock region every 60 sec |
| Deep Bank Permit | $3,200 | Unlocks Deep Bank; immediate Ocean Health \-15 |

## **New loop**

**Allocate boats by region \-\> decide whether to preserve or strip stocks \-\> convert waste into products \-\> use PR/lobbying to survive backlash**

## **Tension**

This is where the satire fully lands:

* the destructive upgrades are often the most profitable  
* scarcity improves price  
* collapse creates new product lines  
* “responsibility” becomes another cost center to optimize around

---

# **First-session timeline at a glance**

| Time | Expected unlock | What the player is mainly doing |
| ----- | ----- | ----- |
| 0:00 | Start at Pier | manual casting |
| 5:00 | 2–4 hand upgrades | active fishing, cozy loop |
| 10:00 | Skiff phase | fuel and hold management |
| 20:00 | Passive gear phase | balancing active fishing with idle gear |
| 35:00 | Fleet phase | assigning boats, paying wages, repairing |
| 55:00 | Processing phase | dealing with storage and contract bottlenecks |
| 75:00 | Regional extraction phase | seeing depletion and dark systems |
| 85:00+ | License Renewal available soon | choosing profit vs ocean damage |

---

# **What a successful 90-minute first run looks like**

By the end of a good first session, the player typically has:

* **2 boats**  
* **1 deckhand**  
* **2–3 passive gear pieces**  
* **1 processing shed**  
* **1 freezer**  
* **1 cannery**  
* **2 completed contracts**  
* **one region below 50% stock**  
* **Ocean Health between 70 and 80**  
* **Trust between 60 and 80**  
* a clear sense that the profitable play is getting uglier

That is exactly where you want the first run to end.

---

# **First prestige: License Renewal**

## **Unlock condition**

License Renewal becomes available when:

* **$12,000 lifetime revenue**  
* **2 contracts completed**  
* **Ocean Health above 50**

Expected timing: **85–95 minutes**

## **Reset**

Resets:

* cash  
* boats  
* fuel  
* facilities  
* contracts  
* regional stock for the run  
* trust and temporary influence

Keeps:

* permanent prestige currency

## **Prestige currency**

**Quota Certificates**

### **First-run formula**

**Quota Certificates \= 1 \+ floor(Lifetime Revenue / 8000\) \+ floor(Completed Contracts / 2\)**

Expected first run:

* **2–3 Quota Certificates**

## **First prestige perks**

| Perk | Cost | Effect |
| ----- | ----- | ----- |
| Harbor Regular | 1 | Start with Rusty Skiff unlocked |
| Fuel Account | 1 | Fuel cap \+10 on all future runs |
| Cold Chain Contact | 2 | Start with \+20 cold storage |
| Reliable Cousin | 2 | Start with Hire Cousin active |

This keeps the second run much faster and lets the player reach the dark systems earlier.

---

# **Why this works**

The complexity ramps in a clean order:

1. **catch fish**  
2. **manage a trip**  
3. **tend passive gear**  
4. **run boats**  
5. **run facilities**  
6. **run an extractive industry**

That gives you the exact feeling you asked for:  
a loop that starts active and friendly, then grows into **resource management \+ tycoon decisions**, and finally turns dark as the player realizes the most efficient business choices are the ones that damage the ocean.


# Definitely Not Overfishing Design

## Summary

`Definitely Not Overfishing` is an arc-first browser incremental game designed to deliver a complete 75-90 minute first run. The player starts in a cozy, tactile fishing loop and gradually becomes the operator of a profitable extraction system. The satire lands through incentives, not lectures: the system rewards depletion, scale, and euphemistic management language until the player realizes they are no longer "the fisher."

## Product Structure

- Primary release target: free browser prototype
- Primary audience: incremental players who want more than rising numbers, especially concept-driven players who share unusual web games
- Session goal: a complete first run that feels worth finishing and worth describing to someone else
- Core progression rule: every phase must add one new management problem and one role change

### Session Spine

1. `Quiet Pier`
   The player learns timing-based manual fishing, auto-selling, and small tactile upgrades in a warm, approachable loop.
2. `Skiff Operator`
   Fuel, hold space, and trip planning introduce trade-offs between safety, efficiency, and value.
3. `Dockside Gear`
   Passive gear and storage bottlenecks shift the player from direct action toward operational thinking.
4. `Fleet Ops`
   Boats, crew, routing, and maintenance produce the key identity shift: the best move is no longer to fish, but to manage fishing.
5. `Processing & Contracts`
   Catch becomes throughput. The player now decides what to process, store, and sell into different product and contract channels.
6. `Regional Extraction`
   Multi-region depletion, bycatch, and public-trust pressure reveal the full industrial logic and lead into the first `License Renewal` reset.

## Core Loop

The game begins with a manual cast-and-catch toy that feels satisfying on its own. That manual layer remains playable throughout the run, but after the early game it becomes a tactical bonus activity rather than the economic center.

The main systemic engine is:

`stock pressure -> slower catches + higher prices`

This relationship must stay intact across the whole prototype. The player should not be cleanly punished for depletion. Instead, scarcity should create a tempting business case for pushing harder, which makes the satire emerge from play.

### Magic Moment

The magic moment is when the player notices they have stopped being the fisher. Around the transition into `Fleet Ops`, the optimal behavior changes from active casting to orchestrating labor, routes, maintenance, and output. That role handoff is the moment players should want to talk about.

## Capability Set

The prototype should include:

- Timing-based manual fishing
- Regional stock depletion and regeneration
- Scarcity-driven pricing
- Upgrades that unlock new phases instead of only increasing numbers
- Manual fishing plus passive income sources
- Boats, holds, fuel, routing, and maintenance management
- Processing and contracts that turn catch into throughput
- Bycatch and ecosystem-damage pressure
- A visible UI tone shift across the run
- A first `License Renewal` prestige/reset

## Tone And Interface

### Personality

The game should feel like a charming host with a hidden agenda: warm, inviting, and trustworthy at first, while gradually revealing a colder and more manipulative logic.

### Visual Direction

Use a `Soft-to-Severe` visual arc.

- Early game: warm coastal surfaces, rounded cards, roomy spacing, tactile gradients, and soft hierarchy
- Mid game: reduced warmth, tighter spacing, denser dashboards, and more operational framing
- Late game: sharper geometry, darker surfaces, colder teal and warning accents, and high-density control panels

The interface should grow more operational without becoming visually noisy. Clarity matters more than density.

### Voice

Use dry corporate optimism. The copy should sound helpful and efficient even when the system is rewarding destructive behavior.

Examples:

- Early CTA: `Cast Line`
- Mid-game action: `Assign Route`
- Late-game action: `Deploy Fleet`
- Late-game success copy: `Excellent yield. Regional efficiency is improving.`

### Anti-Patterns

Avoid:

- Upgrade walls that become unreadable idle mush
- Random currencies that add noise instead of new tensions
- Progression that only compresses time or inflates values
- Meme humor or tonal chaos that undercuts the slow corporate creep
- Moralizing popups that explain the satire instead of letting the player feel it

## MVP Scope

### In Scope

- A complete 75-90 minute first session
- Six phase progression with visible role changes
- Local save persistence only
- A complete first prestige/reset
- Enough balancing and feedback to make the full arc readable and finishable

### Out Of Scope

- Online accounts
- Cloud saves
- Payments
- Live-service events
- Admin balancing tools
- Narrative branching beyond what supports the main arc
- Extra content breadth that does not improve the first run

## Risks

1. Overbuilding before the emotional arc is proven
2. Letting the satire become explicit instead of systemic
3. Adding more systems without enough role change
4. Making the late game dense enough to feel harsh instead of sharp

## Success Criteria

- Players reach the dark turn and describe the role shift in their own words
- At least 50 players finish a run or reach the core transformation in the first public prototype cycle
- The game feels like a complete, memorable session rather than a clever premise that fades out

## Recommended Build Direction

- Frontend: React + TypeScript + Vite
- Backend: None for the prototype
- Database: None for the prototype
- Auth: None
- Payments: None
- Tooling: Codex

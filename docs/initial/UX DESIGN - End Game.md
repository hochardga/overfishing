```markdown
# Design System Document: Technical Industrialism & Optimized Extraction

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Sovereign Terminal."**

This system rejects the "friendly" softness of modern SaaS. It is an aesthetic of cold efficiency, designed for a world where global resource management is a matter of pure calculation. We are moving away from consumer-grade "web" layouts toward a high-density, command-center interface.

The design breaks traditional templates by utilizing **monolithic density** and **asymmetric data weighting**. We do not "delight" the user; we empower the operator. The visual tone is intentionally sterile and slightly unsettling—reflecting a corporate entity that operates with absolute precision amidst a changing global climate. Expect razor-sharp edges, high-information density, and a color palette that feels like a pressurized deep-sea environment.

---

## 2. Colors & Surface Logic

The palette is anchored in the depths of the ocean (`background: #080f14`) and punctuated by the high-visibility tones of industrial machinery.

### Surface Hierarchy & Nesting
We do not use elevation in the traditional sense. There is no "up" in this system, only deeper levels of system integration.
*   **The "No-Line" Rule:** Sectioning is achieved through shifting between `surface-container-low` (`#0a151b`) and `surface-container-high` (`#0f222d`). Never use a 1px border to divide a page; let the tonal shifts in the slate-charcoal spectrum define the zones of operation.
*   **Nesting:** To highlight a data module, nest a `surface-container-lowest` (`#000000`) block inside a `surface-container-highest` (`#112836`) zone. This creates a "recessed" look, like a screen embedded in a heavy industrial console.
*   **The "Glass & Gradient" Rule:** Use Glassmorphism sparingly to simulate high-strength acrylic dividers. Floating HUD elements should use `surface-variant` with a 60% opacity and a 20px backdrop-blur. 
*   **Signature Textures:** Apply a subtle linear gradient from `primary` (`#2ddbde`) to `primary-container` (`#004f51`) for mission-critical CTAs. It should feel like the glow of a phosphor monitor, not a decorative flourish.

---

### 3. Typography: The Functional Narrative

Typography is the backbone of this system. It must feel like a technical manual.

*   **Display & Headlines (Space Grotesk):** We use Space Grotesk for its "industrial-tech" DNA. The slightly wider apertures paired with its geometric rigidity convey authority. 
    *   *Usage:* `display-lg` (3.5rem) is reserved for status-critical metrics (e.g., Total Harvest Tonnage).
*   **Body & Titles (Inter):** Inter provides the necessary legibility for high-density data tables. 
    *   *Usage:* `body-sm` (0.75rem) is our workhorse. In this system, we favor smaller, condensed type to maximize information density on a single screen.
*   **Labels:** `label-sm` (0.6875rem) in Space Grotesk should always be uppercase with a 0.05rem letter-spacing to mimic technical schematics.

---

## 4. Elevation & Depth: Tonal Pressure

Traditional drop shadows are forbidden. In an optimized industrial system, light is artificial and focused.

*   **The Layering Principle:** Depth is "sunk," not "raised." Use `surface-container-lowest` to create "wells" of data.
*   **Ambient Shadows:** If a floating diagnostic window is required, use a high-spread, low-opacity shadow (4%) using the `on-surface` color (`#d1e9fb`). This creates a cold, clinical "glow" rather than a soft shadow.
*   **The "Ghost Border" Fallback:** In high-density tables where tonal shifts aren't enough, use a "Ghost Border": `outline-variant` (`#354b59`) at 15% opacity. It should be felt, not seen.
*   **Hard Edges:** The Roundedness Scale is set to **0px across all tokens**. Every button, card, and input is a sharp, uncompromising rectangle.

---

## 5. Components

### Buttons: Tactical Actuators
*   **Primary:** Background `primary` (`#2ddbde`), Text `on-primary` (`#004849`). No rounded corners. On hover, transition to `primary-dim`.
*   **Secondary:** Outline only using `primary` at 50% opacity. Text is `primary`. 
*   **Tertiary:** `secondary` (`#ffbf00`)—used only for critical system overrides or environmental warnings.

### Data Tables: The Core Component
*   **Forbid Divider Lines:** Separate rows using a 1px `surface-container-high` background shift on hover. 
*   **Density:** Use `spacing-1` (0.2rem) for cell padding. The goal is to see 40+ rows without scrolling.
*   **Alignment:** Numeric data must be tabular-lining and right-aligned for rapid scanning.

### Input Fields: System Entry
*   **Base:** `surface-container-low` background with a 1px bottom-border of `outline`.
*   **Focus:** The bottom-border transitions to `primary` with a subtle `primary-container` glow.
*   **Error:** Background shifts to `error-container` (`#7f2927`) with `error` text.

### Industrial Accents: Status Chips
*   Use `secondary` (`#ffbf00`) for "Caution/Optimization Needed."
*   Use `primary` (`#2ddbde`) for "System Nominal."
*   Use `error` (`#ee7d77`) for "Structural/Environmental Failure."

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace the Grid:** Use the `spacing-px` and `spacing-0.5` for microscopic alignment of technical details.
*   **Monochromatic Foundations:** Keep 90% of the UI in the slate/charcoal range. Use color only for data data significance.
*   **Asymmetric Layouts:** Place a heavy data table on the left and a slim, vertical telemetry rail on the right. Avoid "centered" consumer layouts.

### Don't:
*   **No Rounded Corners:** Any radius above 0px violates the industrial integrity of the system.
*   **No Soft Language:** Use technical, cold terminology. "Get Started" becomes "Initialize System." "Save" becomes "Commit Data."
*   **No Whitespace for "Breath":** In this system, "wasted" space is an inefficiency. Use `spacing-4` (0.9rem) as your maximum gutter; keep elements tightly packed.
*   **No Drop Shadows:** We rely on `surface` layering. If it looks "fuzzy," it is wrong.
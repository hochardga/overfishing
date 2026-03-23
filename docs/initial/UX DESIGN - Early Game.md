# Design System Strategy: The Coastal Dawn

This design system is a comprehensive framework for creating a cozy, minimalist interface tailored for a relaxing fishing experience. It moves beyond standard game UI by prioritizing "Tonal Breathing Room" and "Organic Softness," capturing the ephemeral quality of a seaside sunrise.

## 1. Overview & Creative North Star: "The Tactile Horizon"

The Creative North Star for this system is **The Tactile Horizon**. This concept rejects the rigid, clinical grids of traditional apps in favor of a layout that feels like stacked pieces of sea-glass and sun-bleached driftwood. 

To achieve a "Wholesome Indie" aesthetic, we break the template look through **Intentional Asymmetry**. Do not center-align every element; allow "hero" fish illustrations or inventory items to break out of their containers. Use overlapping surfaces to create a sense of physical depth, mimicking the way tide pools layer over sand.

## 2. Colors: The Sunrise Palette

The palette is derived from the transition of dawn: the warmth of the sun (Primary/Peaches) meeting the cool depth of the water (Secondary/Blues).

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined solely through background color shifts. For example:
- Use `surface-container-low` (#f8f3e8) for a sidebar sitting on a `surface` (#fef9ef) background.
- This creates a soft, "painted" transition rather than a digital "cut."

### Surface Hierarchy & Nesting
Treat the UI as physical layers. Use the `surface-container` tiers to create "nested" depth:
*   **Base Layer:** `surface` (#fef9ef) - The "sand."
*   **Sub-Sections:** `surface-container` (#f3ede0) - Softly recessed areas for menus.
*   **Active Cards:** `surface-container-lowest` (#ffffff) - High-contrast "paper" elements that feel closer to the user.

### The "Glass & Gradient" Rule
Floating HUD elements (like a "Current Bait" indicator) should utilize **Glassmorphism**. Use `surface` colors at 70% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** Apply a subtle linear gradient from `primary` (#8a502f) to `primary-container` (#feb289) on main action buttons (e.g., "Cast Line") to provide a sun-drenched, "glow" effect.

## 3. Typography: The Friendly Script

We use **Plus Jakarta Sans** across all scales. Its rounded terminals and open counters provide the "handcrafted" feel required for a wholesome aesthetic without sacrificing legibility.

*   **Display (3.5rem - 2.25rem):** Use `display-lg` for catch announcements. The generous letter spacing conveys a sense of calm.
*   **Headline (2rem - 1.5rem):** Use for menu titles. Pair with `on-surface-variant` (#625f53) to reduce visual harshness.
*   **Body (1rem - 0.75rem):** Use `body-lg` for narrative text. Ensure a line height of at least 1.6 to maintain the "minimalist" feel.
*   **Labels (0.75rem - 0.68rem):** Reserved for technical data (e.g., "Fish Weight"). Use `primary` (#8a502f) to make these small details feel intentional and warm.

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are too "tech." We achieve hierarchy through **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. The slight shift in "warmth" creates a natural lift.
*   **Ambient Shadows:** For floating modals, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(138, 80, 47, 0.06);`. Note the use of a tinted shadow (Primary #8a502f) rather than black.
*   **The "Ghost Border" Fallback:** If a container requires more definition (e.g., on very bright displays), use the `outline-variant` (#b6b2a3) at **15% opacity**. Never use 100% opaque lines.

## 5. Components

### Buttons (Actionable Warmth)
*   **Primary ("Cast"):** Gradient of `primary` to `primary-container`. `radius-xl` (3rem) for a pill shape. High horizontal padding (`spacing-8`).
*   **Secondary ("Inventory"):** `secondary-container` (#d1f8fb) with `on-secondary-container` text. This provides a "cool water" contrast to the warm primary actions.

### Cards & Lists (The No-Divider Rule)
*   **Inventory Slots:** Forbid the use of divider lines. Separate items using `spacing-4` (1.4rem) and subtle background shifts (alternating between `surface-container` and `surface-container-low`).
*   **Fishing Journal:** Use `surface-container-highest` (#e8e2d2) for the card background with `radius-lg` (2rem) to create a soft, book-like feel.

### Specialized Components
*   **Tension Meter:** A soft, horizontal bar using `secondary` (#416568) for the "safe zone" and a blurred `error_container` (#fa7150) for the high-tension zone.
*   **Catch Toast:** A floating glassmorphic notification using `surface_bright` at 80% opacity, appearing with a subtle "float" animation.

## 6. Do's and Don'ts

### Do
*   **Do** use `spacing-12` or `spacing-16` for page margins to embrace white space.
*   **Do** use `radius-full` for all selection states (chips/toggles).
*   **Do** use `tertiary` (#755b2f) for "Old World" elements like ancient lures or map icons.

### Don't
*   **Don't** use pure black (#000) or pure grey. Always use the `on-surface` (#353328) for text.
*   **Don't** use sharp 90-degree corners. The minimum radius allowed is `radius-sm` (0.5rem), and even then, only for very small utility elements.
*   **Don't** rush the user. Avoid "pulsing" red error states. If an action fails, use a soft `error_container` (#fa7150) with a gentle "shake" animation.
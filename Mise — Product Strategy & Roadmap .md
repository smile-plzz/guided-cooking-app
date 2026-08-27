# Mise — Product Pitch Document

*A complete narrative: intent, concept, problem, solution, features, requirements, and behavioral thesis in one place.*

---

## 1. Intent

**Why does this document exist?**
To capture the full reasoning behind Mise in one place — not just what it is, but *why it needs to exist, why now, and why this specific shape* — so the product can be pitched, built, and evaluated against a single coherent thesis rather than a scattered set of feature ideas.

**Intent of the product itself:**
To become the shared operational layer for how a household feeds itself — planning, shopping, stocking, and cooking — by living permanently and visibly in the one room where all of that actually happens: the kitchen.

---

## 2. The Concept in One Line

**Mise turns any spare screen into a permanent, shared kitchen companion — so a household's meals, pantry, and shopping list live where the cooking happens, not scattered across separate phones and apps.**

---

## 3. The Behavioral Problem

This is the foundation everything else is built on. The problem isn't "there's no good recipe app" — there are hundreds. The problem is behavioral and structural:

### 3.1 Food coordination is fragmented across people and tools
- One person plans meals, another does the shopping, a third cooks — but the information (what's planned, what's in the pantry, what's on the list) lives in disconnected places: a notes app, a messaging thread, someone's memory, a physical piece of paper on the fridge.
- Recipe apps are personal and single-player by default. Meal planning is a household activity being forced through single-user tools.

### 3.2 The kitchen has no persistent interface
- Every existing food-app interaction requires *picking up a phone* — a device that's personal, has notifications, gets put down mid-task, and isn't actually built to survive flour, water, and wet hands at arm's length.
- There is no "always-there" surface for food the way a calendar on the wall or a whiteboard used to be. The kitchen — the one room this all happens in — has no dedicated presence for it.

### 3.3 Recipe apps solve the wrong part of the problem
- Most food apps optimize for *discovery* (finding a new recipe) rather than *execution and coordination* (does the household have the ingredients, who's shopping for what's missing, is the plan visible to everyone who needs it).
- Execution is the daily friction point. Discovery is occasional. Most products are built backwards from what actually causes daily frustration.

### 3.4 Smart displays exist but solve a different, more expensive problem
- Google Nest Hub / Echo Show-type devices are general-purpose, priced like consumer electronics, and not designed around food-specific workflows (pantry state, shared shopping lists, guided step-by-step cooking, household meal sync).
- Their cost and general-purpose nature make them a *maybe* purchase, not a default one — so most kitchens still don't have a dedicated screen at all.

**The underlying behavioral insight:** households already *want* a shared surface for food coordination — that's why fridges get covered in lists and sticky notes — but no digital product has made that surface cheap, persistent, and purpose-built enough to actually replace the fridge door.

---

## 4. The Solution

### 4.1 What Mise is
A household food companion app with two coordinated layers:

- **My Mise** — the personal layer (nutrition, preferences, private history, personal meal planning, adding to the shared list). Lives on a personal phone.
- **Our Mise** — the shared layer (today's meals, shopping list, pantry, recipes, guided cooking, household activity). Lives on a shared surface — ideally a permanently mounted screen in the kitchen.

### 4.2 What makes it different: Kitchen Mode
Instead of asking a household to buy new hardware, Mise makes the shared layer work on **whatever old Android tablet or phone is already sitting in a drawer**:

1. Install Mise
2. Select "Kitchen Display"
3. Pair it with the household
4. Mount it in the kitchen
5. It becomes the permanent "Our Mise" surface — kiosk-style, always on, always visible

This removes the single biggest historical barrier to a dedicated kitchen screen: cost and commitment. Nobody has to decide to *buy* a kitchen gadget. They just repurpose something they already own.

### 4.3 The reframed question
Not "how do we build a kitchen gadget business," but:

> **"What happens if a cooking app permanently lives in the kitchen?"**

This is a software distribution and behavior-change problem before it's a hardware problem — which is why hardware is deliberately built last, not first.

---

## 5. Why This, Why Now

- **Idle hardware is everywhere.** Old Android tablets and phones are extremely common in drawers after every upgrade cycle — an underused resource Mise can activate instead of requiring new manufacturing or purchase decisions.
- **Household coordination tools have exploded everywhere except food.** Shared calendars, shared docs, shared task apps are normal now. Food — arguably the most frequent, highest-friction shared household activity — still runs on sticky notes and group chats.
- **Smart-display category exists but hasn't been claimed by food.** Nest Hub and Echo Show proved people are open to a screen in the kitchen; they just haven't proven it needs to be general-purpose or expensive. There's room for a purpose-built, near-free alternative.
- **A BYOD-first strategy is a genuinely differentiated go-to-market**, not just a cheaper one — it turns the pitch from "buy our gadget" into "here's a free upgrade to a device you already own," which is both lower-friction and more novel as a growth story.

---

## 6. What (Product Definition)

### 6.1 Core object model
- **Household** — the shared unit (family, roommates, etc.)
- **Member** — an individual with a personal (My Mise) profile inside a household
- **Kitchen Display** — a paired device running Our Mise in Kitchen Mode
- **Pantry** — shared inventory of what's on hand
- **Shopping List** — shared, addressable list of items to buy
- **Meal Plan** — shared schedule of upcoming meals
- **Recipe** — a guided, step-by-step cooking flow
- **Activity Feed** — lightweight log of who did what, for shared transparency without needing explicit conflict resolution

### 6.2 Core user journeys
1. **Set up Kitchen Mode** — turn a spare device into the household's shared display.
2. **Plan a meal** — from personal phone or shared display, add a meal to the household plan.
3. **Manage the shopping list** — add, check off, and see items in real time from any household member's device.
4. **Track the pantry** — know what's already at home before planning or shopping.
5. **Cook, guided** — follow a recipe step-by-step on the kitchen display, hands-free-friendly, with built-in timers.
6. **See household activity** — glance at the display and know what's planned, what's missing, and what's been done.

---

## 7. How (Mechanism & Experience Design)

### 7.1 Kitchen Mode / Kiosk behavior
- App-pinning / screen-pinning so the display can't accidentally exit Mise
- Auto-launch on boot and auto-recovery after crash or reboot
- Notification and other-app suppression while in Kitchen Mode
- Designed to run acceptably on old, heterogeneous Android hardware (varied OS versions, screen sizes, RAM) — favoring a lightweight web/PWA-based kiosk shell over a heavy native build, at least initially

### 7.2 Sync model
- Shared data (pantry, shopping list, meal plan) stored centrally, not on-device, so device swaps and re-pairing don't lose household state
- Item-level operations (add/check off/edit a single entry) rather than editing one shared blob, to avoid multi-person edit conflicts
- Local caching of core "Our Mise" data so a mid-cooking Wi-Fi drop doesn't strand a guided-cooking session; sync resumes automatically

### 7.3 Guided cooking UX
- Large touch targets, high-contrast text legible from ~1–1.5m
- Step-by-step pacing with built-in timers
- Minimal typing requirements; swipe/tap navigation suited to messy or occupied hands
- Designed as its own surface, not a scaled-up phone recipe view

### 7.4 Device lifecycle
- Clean re-pairing flow when an old device dies or is swapped — household data lives in the account/cloud, the new device just re-authenticates as "the kitchen display"
- Eventual instrumentation to learn the real distribution of device types/OS versions in use, to inform both software support floor and future hardware spec

---

## 8. Feature Requirements

### 8.1 MVP (BYOD validation phase)
- Household account creation and member invites
- Personal layer: preferences, personal meal planning, add-to-shared-list
- Shared layer: pantry (manual entry), shopping list (add/check off, real-time sync), basic meal plan, recipe library, guided cooking mode
- Kitchen Mode: pairing flow + basic kiosk behavior (auto-launch, screen pinning)
- Activity feed (lightweight, who-did-what)

### 8.2 Phase 2 (retention & hardening)
- Kiosk robustness: crash recovery, notification suppression, support-floor-defined device compatibility
- Offline caching for core shared data and in-progress guided cooking
- Onboarding fast-path: import shopping list from text/photo, seed a starter pantry, so day one isn't an empty shell
- Basic usage instrumentation: shopping list edits/week, pantry updates/week, guided-cooking completion rate, whether the display stays mounted after 2–4 weeks

### 8.3 Phase 3 (monetization — Mise+)
- Advanced nutrition analytics
- Personalized meal planning / recommendations
- Household dietary intelligence
- Consumption analytics
- AI-driven features (recipe suggestions, smart pantry replenishment prompts)
- Multiple displays / advanced family features
- Priced per household, not per user, at roughly $3–5/month

### 8.4 Phase 4 (optional hardware — Mise Display)
- Only pursued once BYOD retention is proven
- Target price ~$30–50 (~৳3,000–5,000)
- Spec target: 7–8" IPS touchscreen, low-end Android/Linux SoC, Wi-Fi, USB-C, speaker — no OLED, camera, mic, or cellular
- Intelligence stays server-side; device only needs to render Mise reliably and handle always-on power without the battery-degradation issues of a repurposed old tablet

---

## 9. The App-Level Problems Being Solved

| Problem | Mise's Answer |
|---|---|
| Food planning info scattered across people/tools | Single shared household layer ("Our Mise") synced live across devices |
| No persistent, purpose-built kitchen surface | Kitchen Mode turns any spare device into an always-on shared display |
| Recipe apps optimize discovery over execution | Mise prioritizes pantry, shopping list, and guided cooking — the daily execution loop — over recipe browsing |
| Smart displays are expensive/general-purpose | Free BYOD path first; purpose-built sub-$50 hardware only if/when needed |
| Personal vs. shared data gets muddled in most apps | Explicit My Mise / Our Mise split, so personal data stays personal and household data stays shared |
| Multi-person edits cause conflict/mess | Item-level addressable operations + lightweight activity feed instead of shared-document editing |

---

## 10. Business Model Summary

- **Free forever**: household coordination core (shopping list, pantry, basic meal plan, Kitchen Mode/display itself) — this is the retention engine and must never be paywalled.
- **Mise+ subscription (~$3–5/month, per household)**: the intelligence layer (analytics, personalization, AI features, multi-display support).
- **Optional hardware (Mise Display, ~$30–50)**: near-cost, for households without a spare device; not a margin driver, but expands addressable market and gives the brand a tangible retail presence.

---

## 11. Risks & Honest Counterpoints

- **Core behavioral risk**: the "permanent shared kitchen screen" habit may not form — novelty could fade within weeks, and households could revert to phones/paper. This is the single biggest risk to the entire thesis, bigger than pricing or hardware.
- **Device fragmentation risk**: old Android hardware varies wildly (OS version, RAM, screen size); inconsistent experience could generate negative word-of-mouth before a hardware fix is ready.
- **Category risk**: "permanent shared kitchen screen" is a mostly unproven category — this is both the opportunity (undefended ground) and the danger (unproven demand).
- **Delay risk**: waiting too long on hardware could cede the no-spare-device segment to a well-funded smart-display incumbent, or lose interested households who simply don't have an old tablet.

---

## 12. Validation Plan (What Proves This Works)

Before investing in kiosk polish or hardware, run a small pilot using households' **own old tablets**, and measure:
- Shopping list edits per week
- Pantry updates per week
- Guided-cooking session completion rate
- Whether the display **stays mounted and in daily use** after 2–4 weeks (the strongest signal — stronger than survey interest or waitlist size)

**Kill/pivot signal**: if engagement drops off within the first couple of weeks and households revert to personal-phone usage, that indicates the "Our Mise" shared-surface premise is weaker than assumed. In that case, the better path may be doubling down on My Mise as the core product and treating shared/kitchen-display sync as a lighter optional feature rather than the central differentiator.

---

## 13. The Pitch, Compressed

> Every household coordinates food through scattered tools and sticky notes because no digital product has made a shared kitchen surface cheap and persistent enough to replace the fridge door. Mise fixes this not by selling new hardware, but by turning a spare tablet you already own into a permanent, shared kitchen companion — synced live with everyone's phone — for free. If it earns a permanent spot on the wall, Mise becomes the daily operating system for how a household eats: what's planned, what's in stock, what needs buying, and how to cook it — with a light, optional hardware product and a household subscription layered on only once that daily habit is proven.

# Mise — Product Strategy & Roadmap (Comprehensive)

*Working document for ideation on where the product should go next. Expanded with multiple perspectives, open questions, and reasoned answers across product, technical, business, and market angles.*

---

## 1. Core Thesis

Mise is not a recipe app and not a tablet company. It's a **household food operating system** — a shared layer for meal planning, pantry, shopping, and guided cooking that lives across a family's devices, with the kitchen itself as the primary surface.

The defining insight from recent strategy work: **the software is the product, the display is just its physical manifestation.** Hardware should never be the thing Mise bets on — it's an optional convenience layer on top of a product that already works on a phone, an old tablet, or a browser.

This reframes the core question from *"how do we build a kitchen gadget business"* to *"what happens when a cooking app permanently lives in the kitchen, for free, using hardware people already own?"*

---

## 2. Product Architecture

### My Mise (personal layer)
- Personal nutrition tracking
- Individual preferences and dietary profile
- Private history
- Personal meal planning
- Adding items to the shared grocery list

### Our Mise (household layer — lives on the Kitchen Display)
- Today's meals
- Shared shopping list
- Pantry inventory
- Recipes
- Guided cooking mode
- Household activity feed

Everything syncs live between the two. A person's phone stays personal; the kitchen device becomes the shared, always-on surface for the household.

### Kitchen Mode (the pivotal feature)
A software mode that turns **any existing Android tablet or phone** into a dedicated Mise kitchen display:

1. Install Mise
2. Select "Kitchen Display"
3. Pair with household
4. Mount in the kitchen
5. Done — kiosk-style, always-on, shared interface

This removes the single biggest adoption barrier (hardware cost) and turns idle drawer-tablets into the on-ramp for the product.

---

## 3. Hardware Strategy (deliberately secondary)

| Stage | What it is | Price | Purpose |
|---|---|---|---|
| Now | Web/PWA + BYOD old Android device | Free | Validate demand, zero manufacturing risk |
| Next | Kiosk mode / dedicated Kitchen Mode polish | Free | Make BYOD feel like a real appliance, not "a cheap tablet stuck on a wall" |
| Later | Mise Display (optional dedicated hardware) | ~$30–50 (~৳3,000–5,000) | Serve households with no spare device |
| Eventually | Mise hardware ecosystem | Premium tiers | IoT integrations, multi-display households |

Key discipline: **do not manufacture anything until BYOD Kitchen Mode has proven people actually want a permanent kitchen display.** Hardware is a fallback for people without a spare device, not the core offer.

If/when hardware is built, design backwards from a sub-$50 price point: 7–8" IPS touchscreen, low-end Android/Linux SoC, Wi-Fi, USB-C, speaker — no OLED, no camera, no mic, no cellular. Intelligence stays server-side; the device just needs to render Mise well.

---

## 4. Business Model

Hardware was originally considered the revenue anchor — that's now explicitly de-prioritized. The intended structure:

- **Free core**: shopping list, recipes, pantry, meal planning, kitchen display (BYOD)
- **Mise+ subscription (~$3–5/month)**, layered in once the free product has traction:
  - Advanced nutrition analytics
  - Personalized meal planning
  - Household dietary intelligence
  - Deeper recipe recommendations
  - Consumption analytics
  - AI-driven features
  - Multiple displays / advanced family features
- **Optional hardware (Mise Display)**: sold near cost, as a convenience purchase rather than a margin driver

This is a much more defensible business than "sell cheap Android tablets" — it's a household software subscription with an optional, low-margin hardware accessory.

---

## 5. Development Roadmap

1. **Web/PWA on old Android device** — prove the shared-kitchen-surface concept works at all, with zero hardware investment
2. **Kiosk mode / dedicated Kitchen Mode** — harden the BYOD experience: auto-launch, screen-always-on handling, recovery from flaky old-device batteries/storage, simple re-pairing
3. **Cheap Mise Display hardware (~$30–50)** — only after BYOD demand is validated
4. **Full Mise hardware ecosystem + IoT integrations** — long-term, once the software layer and subscription base are established

---

## 6. Multi-Angle Deep Dive: Questions & Working Answers

This section pressure-tests the concept from more directions than the roadmap above, with a working answer for each so this doc can drive decisions rather than just list open items.

### 6.1 Market & Positioning

**Q: Who is the actual first customer — the price-sensitive household, or someone else entirely?**
A: Probably not the most price-sensitive household first, even though the original pricing conversation started there. The BYOD angle works best where an old tablet is *already sitting in a drawer* — that's more common in households that have upgraded phones/tablets recently (i.e., moderately tech-adopting, not the most budget-constrained segment). The most price-sensitive households may not have a spare device at all, which would push them toward the $30–50 hardware tier later, not the free BYOD tier now. Early target: households that (a) already cook somewhat seriously, (b) have a spare Android device, (c) are annoyed by juggling recipes/shopping lists across apps or paper.

**Q: What is Mise actually competing with, category-wise?**
A: Three different competitors depending on the feature:
- Recipe/meal-planning apps (Paprika, Mealime, Yummly) — Mise's edge is the *shared household surface*, not just personal planning.
- Smart displays (Google Nest Hub, Echo Show) — Mise's edge is being purpose-built for cooking/food, not general-purpose; also far cheaper via BYOD.
- Nothing, in the "permanent shared kitchen screen" category — this is closer to a new category than a direct feature-for-feature competitor fight, which is both the opportunity and the risk (unproven category = unproven demand).

**Q: Is "turn your old tablet into a kitchen display" a big enough hook to drive organic growth, or does it need a stronger wedge?**
A: It's a strong *marketing* hook (novel, concrete, low-friction) but may not be a strong enough *retention* hook by itself. The wedge that keeps people opening it daily is more likely the shared shopping list + pantry (mundane, high-frequency household coordination) than the guided-cooking feature (occasional, high-effort). Worth treating the shopping list/pantry as the daily-use anchor and guided cooking as the differentiator that shows up a few times a week.

### 6.2 Product & UX

**Q: What's the very first five minutes for a new household, and where does it break?**
A: Likely breakpoints: (1) finding an actually-old-enough spare device that still runs a reasonable OS/browser, (2) getting both partners to install "their" Mise vs. understanding one device becomes the shared one, (3) populating the pantry/shopping list with enough real data that it feels useful on day one rather than an empty shell. The onboarding needs a fast-path to *something* useful immediately — e.g., importing a shopping list from text/photo, or seeding a starter pantry — rather than requiring manual setup before value appears.

**Q: How does "Our Mise" handle multiple people editing the same list/pantry at once?**
A: Needs a simple, visible sync model (e.g., last-write-wins per item, with a lightweight activity feed showing who added what) rather than anything requiring conflict resolution UI — households won't tolerate merge conflicts on a grocery list. This favors an architecture where individual items are independently addressable (append/check-off operations) rather than editing a single shared blob.

**Q: What does the guided-cooking experience need to feel like at arm's length on a wall-mounted screen?**
A: Large touch targets, high-contrast text readable from ~1–1.5m, minimal reliance on typing, step-by-step pacing with built-in timers, and ideally voice-free navigation (swipe/tap to advance) since hands are often messy or full while cooking. This is a meaningfully different UI than a phone recipe app and should be designed as its own surface, not a scaled-up phone view.

**Q: What happens when the "old tablet" dies or the household wants to swap devices?**
A: Needs a clean re-pairing flow: household data lives in the cloud/account, not on the device, so a new device just re-authenticates as "the kitchen display" and inherits Our Mise state. This should be designed early since device churn (especially with genuinely old hardware) is a near-certainty, not an edge case.

### 6.3 Technical & Kiosk Considerations

**Q: What does "kiosk mode" actually require on old, heterogeneous Android hardware?**
A: Screen pinning / app-pinning to prevent accidental exits, auto-launch on boot, disabling notification shade and other app switching, and graceful recovery from crashes or reboots without manual intervention. Because target devices are old and varied (different Android versions, screen sizes, RAM constraints), the app needs to degrade gracefully rather than assume a modern, consistent runtime — this argues for a lightweight PWA/web-based kiosk shell over a heavy native app, at least initially.

**Q: How should the device handle being permanently plugged in?**
A: Old lithium batteries degrade faster under constant full charge and heat; the kiosk shell should ideally manage charge behavior if the OS allows it (or the eventual hardware SKU can bypass the battery issue by running screen-on-power-only). This is a real long-term reliability risk for the BYOD approach worth flagging even if it's not solvable in software alone.

**Q: What's the offline story?**
A: Core "Our Mise" data (today's meals, shopping list, pantry, recipe currently in use) should be cached locally so a mid-cooking Wi-Fi drop doesn't strand someone mid-recipe. Sync should be eventually-consistent and resume automatically, not require manual retry.

**Q: What's the minimum viable OS/hardware bar for "old tablets people actually have"?**
A: This needs actual data rather than assumption — a lightweight survey/telemetry question during onboarding ("what device/Android version are you using as your Kitchen Display?") would let the roadmap be driven by real device distribution instead of guesswork, and would also inform the eventual hardware SKU's minimum spec.

### 6.4 Business Model & Monetization

**Q: Where exactly does free end and Mise+ begin?**
A: Working line: the *coordination* features (shopping list, pantry, basic meal plan, kitchen display itself) stay free indefinitely, because they're the retention engine and the reason Kitchen Mode is attractive at all. The *intelligence* features (nutrition analytics, personalized recommendations, household dietary intelligence, consumption analytics, AI features) are the paid layer, because they require ongoing compute/data work and are a genuine upgrade rather than a paywall on core utility. This avoids the common trap of gating the feature that drives adoption.

**Q: Per-household or per-user pricing?**
A: Per-household makes more sense given the product's premise (Our Mise is inherently shared), and also matches the psychology of "$3–5/month for the family," which is an easier purchase decision than per-seat pricing for what's functionally a shared kitchen tool. Per-user pricing would undercut the core "household" framing.

**Q: If hardware isn't the revenue driver, why build it at all?**
A: Three reasons even at near-cost pricing: (1) it removes the adoption barrier for the segment with no spare device, expanding TAM beyond BYOD households; (2) a controlled hardware SKU can be tuned for reliability/battery/kiosk behavior in ways a random old tablet can't, improving retention for that segment; (3) it's a brand anchor — "Mise Display" as a tangible product gives the company a retail/press story that a pure software subscription doesn't.

**Q: What's the realistic monetization timeline?**
A: Free BYOD product should run long enough to prove retention (daily/weekly active usage of shopping list + pantry) before Mise+ is introduced — introducing a paywall too early on an unproven product risks killing the very adoption loop the BYOD strategy was designed to protect.

### 6.5 Risks & Failure Modes

**Q: What's the biggest risk to this whole strategy?**
A: That the "permanent shared kitchen screen" habit simply doesn't form — that after the novelty of Kitchen Mode wears off in week one, households revert to phones or paper for the same tasks. This is a behavior-change risk more than a technical or pricing risk, which is why the recommended next step (below) is a behavioral pilot, not a build-more-features step.

**Q: What's the risk in the BYOD strategy specifically?**
A: Device fragmentation (old Android versions, weird screen sizes, battery/thermal issues) could make the experience inconsistent enough that word-of-mouth turns negative before the product is ready to sell dedicated hardware as the fix. Worth explicitly scoping a "supported device" floor rather than promising it works on literally any old tablet.

**Q: What's the risk in delaying hardware indefinitely?**
A: Some real portion of the target market has no spare device and will bounce off the concept entirely without a purchase option, and competitors (or a well-funded smart-display incumbent) could occupy the "kitchen screen" category first if Mise waits too long to offer any hardware path at all. The mitigation is treating hardware as a *scheduled* later phase, not an indefinitely deferred one — pinned to a specific validation milestone rather than "eventually."

### 6.6 Metrics & Validation

**Q: What would actually prove this idea works, before writing kiosk-mode code?**
A: Behavioral signal from a small pilot using households' own old tablets: shopping list edits per week, pantry updates per week, guided-cooking session completion rate, and — most importantly — whether the display stays *mounted and in daily use* after 2–4 weeks rather than being taken down or ignored. Survey/interest signals (waitlist size, landing page conversion) are weaker evidence than actual sustained usage on a real kitchen wall.

**Q: What's the kill/pivot signal?**
A: If pilot households stop engaging with the shared display within the first couple of weeks and revert to personal-phone usage, that's a signal the "permanent kitchen surface" premise is weaker than assumed — in which case the better path may be doubling down on My Mise (personal planning) and treating "Our Mise" as a lighter, optional sync feature rather than the core differentiator.

---

## 7. Suggested Immediate Next Step

Before any hardware or even kiosk-mode engineering: run a **lightweight validation test** of Kitchen Mode using the existing app (or a PWA) on a small group's own old tablets, and measure whether a permanently-mounted shared kitchen screen actually changes household behavior (shopping list usage, meal planning frequency, cooking session completion, and whether the device stays mounted after the novelty period). That result should determine whether to invest in kiosk polish next, revisit the "Our Mise" premise, or move faster toward the $30–50 hardware SKU for the no-spare-device segment.

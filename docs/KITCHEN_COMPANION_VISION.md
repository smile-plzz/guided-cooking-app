# Mise Kitchen Companion — Product Direction

Status: product direction agreed during October 2026 ideation. This document captures the decisions that should guide future implementation.

## Product idea

Mise should evolve from a guided-cooking application into a shared kitchen companion: a persistent household interface that keeps a live sense of what food is in the kitchen, what is missing, what needs to be bought, what meals are planned, and what can be cooked with what is already available.

The kitchen surface is not intended to be a powerful smart display or sensor hub. It is a thin client for Mise. The intelligence and household state belong to the software/cloud; the display only needs enough compute, touch capability, and Wi-Fi to render and interact with Mise reliably.

## Consumer pitch

> Mise is a smart kitchen companion that keeps your household's food, shopping, meal planning, and cooking organized in one shared place. Turn an old Android tablet or spare screen into a kitchen display so everyone can instantly see what's available, what's needed, and what can be cooked — while their phones stay synced wherever they are.

## The key strategic decision: BYOD first

The original hardware concept was a tablet-shaped, mountable touchscreen with a minimal Android CPU, basic touch, Wi-Fi, and just enough performance to run Mise. A purpose-built device remains a possible later product, but it should **not** be the initial adoption requirement.

The stronger first product is **Mise Kitchen Mode**: repurpose an old Android tablet/phone or compatible spare screen as the household kitchen terminal.

Setup concept:

1. Install/open Mise on a spare device.
2. Choose **Kitchen Display / Kitchen Mode**.
3. Pair it with a household from a member's phone.
4. Mount or place it in the kitchen.
5. Use it as the shared household entry point.

This removes the largest barrier identified during ideation: a ~$99 dedicated kitchen gadget is too expensive for many households and risks making Mise a luxury purchase. BYOD makes the physical experience accessible without forcing a hardware purchase.

A dedicated Mise Display can be explored only after Kitchen Mode proves retention. If eventually manufactured, the working target is roughly **$30–50 / ৳3,000–5,000**, using inexpensive 7–8 inch touch hardware, Wi-Fi, minimal compute, simple audio if useful, and no unnecessary premium components.

## Shared display behavior

The kitchen display belongs to the **house**, not an individual.

- No normal per-person login at the kitchen screen.
- It is a public/shared entry point for members of that household.
- Pairing establishes which household it belongs to.
- Household information is immediately accessible.
- Personal/private information stays on individual members' apps unless explicitly designed for shared display.
- Touch-first interaction for V1; voice/assistant complexity is deliberately deferred.
- The preferred idle behavior is low-power/sleep with **tap to wake** rather than requiring an expensive always-on display.
- The UI should work at kitchen distance with large touch targets and minimal typing.

## My Mise vs Our Mise

### My Mise — personal phone experience

Individual members can use their own app for:

- personal dietary preferences
- personal nutrition/consumption tracking
- personal history
- meal planning contributions
- adding items to the household shopping list
- checking the list while shopping

### Our Mise — kitchen/shared experience

The kitchen surface exposes shared household state:

- pantry / kitchen inventory
- shopping list
- meal plan
- today's meals
- recipe suggestions
- guided cooking
- household activity/status

The kitchen display should not casually expose another person's private nutritional history.

## The household loop

The product should connect these activities rather than treating them as isolated features:

**Kitchen state → Meal planning → Shopping → Cooking → Consumption → Updated kitchen state**

Nutrition and dietary analytics sit across this loop.

## Kitchen state

The central promise is that Mise gives the household an ongoing sense of:

- what is currently in the kitchen
- what is low or missing
- what needs to be bought
- what is planned to be eaten
- what can be cooked from available ingredients

For V1, pantry state can be manually maintained through the phone or kitchen display. Sensors, RFID, smart shelves, cameras, or other automatic inventory mechanisms are **not required** for the first product.

The first version should validate whether the shared state itself is useful before adding IoT sensing complexity.

## Home / wake experience

When somebody taps the kitchen screen, it should answer the question: **"What's happening in our kitchen?"**

A useful home surface could show:

- today's planned meal / "What's for dinner?"
- whether its ingredients are available
- **Cook with what I have**
- items that should be used soon
- shopping-list item count
- pantry summary
- recent household activity such as an item being purchased
- continue an in-progress cooking session

Example concept:

```text
Good evening

WHAT'S HAPPENING IN YOUR KITCHEN?

Tonight: Chicken Curry
8/8 ingredients available
[ Start cooking ]

[ Shopping · 6 items ]   [ Pantry · 23 items ]

[ Cook with what I have ]

Bread was purchased ✓
Milk was added to shopping
```

This should feel like a household appliance/dashboard, not merely the phone website stretched onto a tablet.

## Cook with what I have

Pantry-aware cooking should become a key interaction.

Given the current pantry, Mise can group suggestions such as:

- recipes with every ingredient available
- recipes missing only one or two ingredients
- recipes that use ingredients that should be consumed soon

Example:

```text
Chicken Curry        8/8 ingredients
Chicken & Potato     8/8 ingredients
Creamy Pasta         7/8 ingredients
Missing: parmesan
```

This connects inventory to an immediate decision instead of making the pantry a passive database.

## Shared shopping list and realtime sync

Realtime household coordination is core to the concept.

Example: one household member buys bread and checks it off from their phone. The kitchen display and every other member's list should update immediately so another person does not buy bread again.

The same synchronization principle applies to:

- adding/removing shopping items
- pantry changes
- meal-plan changes
- cooking status where useful

This implies that the current localStorage-only architecture cannot be the final architecture for Kitchen Mode. Household identity, central persistence, and realtime synchronization will eventually be required.

## Guided cooking on the kitchen display

The existing guided cooking flow becomes more valuable on a permanent kitchen surface.

When a recipe starts, the display should shift from dashboard mode into a focused cooking mode with:

- one clear step at a time
- large previous/next controls
- built-in timers
- visible progress
- ingredient/serving context
- minimal text entry
- recovery after refresh/network interruption

The goal is to make the dedicated surface genuinely better during cooking than repeatedly unlocking a personal phone.

## Dietary and nutritional layer

Nutrition should complement the kitchen model rather than turn Mise into a conventional calorie-counter.

The long-term idea is: **Mise can help understand consumption because it already understands the household's meals and ingredients.**

Potential personal features include:

- calories and macro estimates
- dietary targets/preferences
- meal history
- consumption patterns
- weekly nutrition summaries
- meal suggestions informed by pantry + dietary goals

A cooked household recipe can become the starting point for consumption logging (for example, selecting that a member ate one serving) rather than requiring them to reconstruct every ingredient manually.

Nutrition should remain a later intelligence layer. V1 should prioritize household state, shopping, planning, pantry, and cooking synchronization.

## Family / household permissions

Initial principle:

**Shared operational data** can be available from the public kitchen display:

- pantry
- shopping
- meal plan
- recipes
- cooking

**Personal data** should remain tied to individual members:

- private nutrition history
- individual dietary analytics
- personal preferences where disclosure is not required

Later permission design can distinguish household admin/member/display roles, but the kitchen display itself should remain low-friction and should not require people to log in every time they enter the kitchen.

## V1 product priorities

1. Household model and pairing.
2. Kitchen Mode optimized for old Android tablets / PWA-capable devices.
3. Shared realtime shopping list.
4. Shared manual pantry.
5. Pantry-aware recipe suggestions / Cook with what I have.
6. Shared meal planning.
7. Kitchen-friendly guided cooking.
8. Tap-to-wake / low-friction display behavior where platform support permits.
9. Basic household activity feedback.

Not V1 priorities:

- custom manufactured hardware
- cameras
- RFID
- smart shelves/load cells
- voice assistant
- complex AI agent behavior
- automatic nutrition inference without reliable data

## Technical implications

The existing app is a strong prototype for the food/cooking workflows, but Kitchen Mode changes the persistence model.

The implementation path should introduce:

- household identity
- member accounts on personal devices
- display pairing tokens / device identity
- centrally persisted household state
- realtime subscriptions or equivalent push synchronization
- offline/local cache so cooking survives weak Wi-Fi
- item-level mutations for shopping/pantry to reduce conflicts
- responsive Kitchen Mode layouts optimized for 7–10 inch landscape/portrait screens
- PWA/kiosk behavior that works on low-end and older Android hardware

The dedicated display should remain computationally cheap. Recommendation or nutrition computation can happen server-side where appropriate.

## Validation before hardware

The most important test is not whether people say the concept is interesting. It is whether they keep an old tablet mounted in the kitchen and continue using it.

Pilot with BYOD households and measure:

- display still mounted/active after 2–4 weeks
- shopping-list edits per week
- cross-device shopping-list completion
- pantry update frequency
- recipe starts from Cook with what I have
- guided-cooking completion
- meal-plan usage
- repeat weekly active households

If the shared kitchen display habit does not persist, do not manufacture hardware. Keep the strong mobile/shared software pieces and reassess the role of the dedicated surface.

## Business direction

The software is the product; the screen is an endpoint.

A plausible structure is:

- **Free/core Mise:** recipes, guided cooking, pantry, shared shopping, basic meal planning, Kitchen Mode.
- **Optional Mise+ later:** advanced nutrition analytics, personalized planning, household dietary intelligence, deeper recommendations/AI, consumption analytics, advanced family features.
- **Optional Mise Display later:** only for households without suitable spare hardware, after BYOD validates demand.

This keeps Mise useful before a household spends money and avoids making hardware price the adoption gate.

## Product thesis

> Mise gives the kitchen a shared memory. It knows what the household has, what it needs, what is planned, and what can be cooked — and makes that state accessible both on everyone's phone and on a screen that permanently lives where the food does.

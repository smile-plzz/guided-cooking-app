/**
 * Offline ingredient substitutions.
 *
 * The original build called a third-party endpoint for this. A fixed table is
 * better here: it is instant, needs no API key, and covers the swaps people
 * actually search for mid-recipe. Ratios are stated where they matter.
 */
const TABLE = [
  { for: ['butter'], swaps: ['Equal weight of margarine', 'Ghee, 1:1 (adds nuttiness)', 'Neutral oil at ¾ the weight, for frying only'] },
  { for: ['buttermilk'], swaps: ['1 cup milk + 1 tbsp lemon juice, rested 10 min', 'Plain yoghurt thinned with milk to a pourable consistency'] },
  { for: ['heavy cream', 'double cream', 'cream'], swaps: ['¾ cup whole milk + ¼ cup melted butter (will not whip)', 'Full-fat coconut milk, 1:1'] },
  { for: ['milk'], swaps: ['Any unsweetened plant milk, 1:1', 'Half evaporated milk, half water'] },
  { for: ['egg', 'eggs'], swaps: ['1 tbsp ground flaxseed + 3 tbsp water, rested 5 min (binding only)', '¼ cup unsweetened applesauce (baking)', '3 tbsp aquafaba (whipping)'] },
  { for: ['sour cream'], swaps: ['Greek yoghurt, 1:1', 'Crème fraîche, 1:1'] },
  { for: ['yogurt', 'yoghurt', 'দই'], swaps: ['Sour cream, 1:1', 'Coconut yoghurt for dairy-free'] },
  { for: ['parmesan'], swaps: ['Pecorino romano (saltier — use less)', 'Grana padano, 1:1', 'Nutritional yeast for dairy-free'] },
  { for: ['self-raising flour', 'self raising flour'], swaps: ['1 cup plain flour + 1½ tsp baking powder + ¼ tsp salt'] },
  { for: ['baking powder'], swaps: ['¼ tsp baking soda + ½ tsp cream of tartar per 1 tsp'] },
  { for: ['cornstarch', 'cornflour'], swaps: ['2 tbsp plain flour per 1 tbsp cornstarch', 'Arrowroot, 1:1'] },
  { for: ['brown sugar'], swaps: ['1 cup white sugar + 1 tbsp molasses', 'Coconut sugar, 1:1'] },
  { for: ['honey'], swaps: ['Maple syrup, 1:1', 'Golden syrup, 1:1'] },
  { for: ['white wine'], swaps: ['Equal stock + 1 tsp white wine vinegar', 'Dry vermouth, 1:1'] },
  { for: ['red wine'], swaps: ['Equal beef stock + 1 tsp red wine vinegar', 'Unsweetened cranberry juice'] },
  { for: ['shallot', 'shallots'], swaps: ['Half a small onion, finely diced', 'White part of spring onion'] },
  { for: ['garlic'], swaps: ['⅛ tsp garlic powder per clove', 'Garlic paste, ½ tsp per clove'] },
  { for: ['fresh ginger', 'ginger', 'আদা'], swaps: ['¼ tsp ground ginger per 1 tbsp fresh', 'Ginger paste, 1:1'] },
  { for: ['lemon juice'], swaps: ['Lime juice, 1:1', 'White wine vinegar at half the amount'] },
  { for: ['soy sauce'], swaps: ['Tamari, 1:1 (gluten-free)', 'Coconut aminos, 1:1 (sweeter, less salty)'] },
  { for: ['fish sauce'], swaps: ['Soy sauce + a pinch of salt', 'Worcestershire sauce at half the amount'] },
  { for: ['mustard seeds', 'সর্ষে', 'কালো সর্ষে', 'সাদা সর্ষে'], swaps: ['Ready-made mustard paste, ½ tsp per tsp of seed', 'Wasabi paste in a pinch — same pungency, different aroma'] },
  { for: ['mustard oil', 'সর্ষের তেল'], swaps: ['Any neutral oil + ½ tsp mustard paste stirred in', 'Rapeseed oil (closest raw flavour)'] },
  { for: ['poppy seed', 'poppy seeds', 'পোস্ত'], swaps: ['Blanched almonds ground to a paste', 'Cashew paste — sweeter, thickens the same way'] },
  { for: ['panch phoron', 'পাঁচফোড়ন'], swaps: ['Equal parts cumin, fennel, fenugreek, nigella and mustard seed'] },
  { for: ['ghee', 'ঘি'], swaps: ['Clarified butter, 1:1', 'Butter, 1:1 (lower smoke point)'] },
  { for: ['coconut milk', 'নারকেলের দুধ'], swaps: ['Cream thinned with water', 'Blend desiccated coconut with hot water, then strain'] },
  { for: ['tamarind', 'তেঁতুল'], swaps: ['Equal lime juice + a pinch of brown sugar', 'Amchur (dried mango powder), ½ tsp per tbsp of pulp'] },
  { for: ['garam masala'], swaps: ['Equal parts ground cumin, coriander, cardamom and cinnamon'] },
  { for: ['cumin', 'জিরা'], swaps: ['Ground coriander, 1:1 (milder)', 'Caraway seed, ½:1'] },
  { for: ['turmeric', 'হলুদ'], swaps: ['Mild curry powder — colour only, changes the flavour'] },
  { for: ['green chili', 'green chilli', 'কাঁচা লঙ্কা'], swaps: ['Serrano or jalapeño, seeds removed to soften the heat', '¼ tsp cayenne per chilli'] },
  { for: ['paneer'], swaps: ['Firm tofu, pressed', 'Halloumi (saltier — skip added salt)'] },
  { for: ['breadcrumbs'], swaps: ['Crushed cornflakes or crackers', 'Rolled oats blitzed fine'] },
  { for: ['stock', 'broth'], swaps: ['1 stock cube per 500 ml water', 'Water + a splash of soy sauce'] },
  { for: ['basil'], swaps: ['Fresh oregano or thyme at half the amount', '1 tsp dried basil per tbsp fresh'] },
  { for: ['parsley'], swaps: ['Coriander leaf, 1:1 (very different aroma)', 'Celery leaf, 1:1'] },
];

const LOOKUP = new Map();
for (const entry of TABLE) {
  for (const name of entry.for) LOOKUP.set(name.toLowerCase(), entry.swaps);
}

/**
 * Finds substitutions for an ingredient name. Falls back to the longest
 * matching table key contained in the name, so "2 cloves fresh garlic" and
 * "garlic paste" both resolve to the garlic entry.
 */
export function findSubstitutes(ingredientName) {
  const name = (ingredientName || '').toLowerCase().trim();
  if (!name) return [];
  if (LOOKUP.has(name)) return LOOKUP.get(name);

  let best = null;
  for (const [key, swaps] of LOOKUP) {
    if (name.includes(key) && (!best || key.length > best.key.length)) {
      best = { key, swaps };
    }
  }
  return best ? best.swaps : [];
}

export const SUBSTITUTION_COUNT = TABLE.length;

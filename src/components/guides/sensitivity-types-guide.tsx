'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, AlertTriangle, Shield, Search, Zap, XCircle, CheckCircle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from '@/lib/hooks/use-translations'

interface AllergenGuide {
  type: string
  name: string
  nameAr: string
  category: 'FDA_9' | 'EU_14'
  severity: 'high' | 'medium' | 'low'
  crossReactivity: string
  description: string
  keywordsEn: string[]
  keywordsAr: string[]
  excludeKeywords: string[]
  triggers: string[]
  howSystemHandles: string
  examples: { scenario: string; result: string; why: string }[]
}

const ALLERGEN_GUIDES: AllergenGuide[] = [
  {
    type: 'milk',
    name: 'Milk',
    nameAr: 'الحليب ومنتجات الألبان',
    category: 'FDA_9',
    severity: 'high',
    crossReactivity: 'dairy',
    description: 'Covers all dairy-derived proteins and derivatives. Includes lactose, casein, whey, and all milk-based products. One of the most common food allergies, especially in children.',
    keywordsEn: ['milk', 'dairy', 'lactose', 'whey', 'casein', 'caseinate', 'butter', 'cream', 'yogurt', 'cheese', 'ghee', 'lactalbumin', 'lactoglobulin', 'curds', 'milk powder', 'skim milk', 'condensed milk', 'buttermilk', 'milk solids', 'milk protein'],
    keywordsAr: ['حليب', 'لبن', 'ألبان', 'لاكتوز', 'زبدة', 'كريمة', 'جبن', 'جبنة', 'يوغرت', 'سمن', 'مصل اللبن', 'كازين', 'قشطة', 'حليب مجفف', 'زبادي'],
    excludeKeywords: [],
    triggers: ['Any ingredient containing milk protein', 'Lactose in any form', 'Dairy derivatives like whey, casein, caseinate', 'Butter and ghee', 'Cheese and cream'],
    howSystemHandles: 'Word-boundary matching ensures "milk" in "milk chocolate" is detected but avoids false matches. All dairy derivatives trigger this allergen type.',
    examples: [
      { scenario: 'Product contains "milk chocolate"', result: 'DETECTED', why: 'Token "milk" matches milk allergen via word-boundary match' },
      { scenario: 'Product contains "coconut milk"', result: 'DETECTED', why: '"milk" token still matches — coconut milk contains the word "milk"' },
      { scenario: 'Product contains "almond butter"', result: 'NOT DETECTED', why: '"almond" triggers tree_nuts, "butter" alone is not enough for milk (requires "milk" token)' },
    ],
  },
  {
    type: 'egg',
    name: 'Egg',
    nameAr: 'البيض',
    category: 'FDA_9',
    severity: 'high',
    crossReactivity: 'egg',
    description: 'Covers egg proteins from both white (albumin) and yolk (vitellin). Also includes E1105 (lysozyme from egg white) and derivatives like meringue.',
    keywordsEn: ['egg', 'eggs', 'albumin', 'albumen', 'ovum', 'ovalbumin', 'ovomucin', 'globulin', 'livetin', 'lysozyme', 'vitellin', 'egg white', 'egg yolk', 'egg powder', 'meringue', 'E1105'],
    keywordsAr: ['بيض', 'بيضة', 'البيض', 'زلال', 'صفار البيض', 'بياض البيض'],
    excludeKeywords: [],
    triggers: ['Any egg-derived protein', 'E1105 additive (lysozyme)', 'Albumin / albumen', 'Egg white or yolk separately'],
    howSystemHandles: 'E1105 is a mapped E-number that directly triggers egg detection. "egg" as a token matches via word-boundary matching.',
    examples: [
      { scenario: 'Product contains "E1105"', result: 'DETECTED', why: 'E1105 is lysozyme derived from egg white — mapped in egg keywords' },
      { scenario: 'Product contains "meringue"', result: 'DETECTED', why: 'Meringue is an egg-based product — listed in egg keywords' },
    ],
  },
  {
    type: 'fish',
    name: 'Fish',
    nameAr: 'السمك والأسماك',
    category: 'FDA_9',
    severity: 'high',
    crossReactivity: 'seafood',
    description: 'Covers all fish species and fish-derived products. Cross-reactive with the seafood group (shellfish).',
    keywordsEn: ['fish', 'salmon', 'tuna', 'cod', 'halibut', 'bass', 'anchovy', 'anchovies', 'tilapia', 'herring', 'mackerel', 'sardine', 'trout', 'fish sauce', 'fish oil', 'fish gelatin'],
    keywordsAr: ['سمك', 'سلمون', 'تونة', 'أسماك', 'السمك', 'أنشوفة', 'سردين', 'ماكريل', 'زيت السمك', 'صلصة السمك'],
    excludeKeywords: [],
    triggers: ['Any fish species name', 'Fish-derived products (oil, sauce, gelatin)', 'Fish extract in any form'],
    howSystemHandles: 'Each fish species name is a separate keyword. Token matching catches compound names like "fish sauce" or "fish oil".',
    examples: [
      { scenario: 'Product contains "fish sauce"', result: 'DETECTED', why: '"fish" token matches fish allergen' },
      { scenario: 'Product contains "tuna"', result: 'DETECTED', why: '"tuna" is a direct fish keyword' },
    ],
  },
  {
    type: 'shellfish_crustacean',
    name: 'Shellfish (Crustacean)',
    nameAr: 'القشريات',
    category: 'FDA_9',
    severity: 'high',
    crossReactivity: 'crustacean',
    description: 'Covers crustacean species: shrimp, crab, lobster, crayfish. Separate from molluscs (EU distinction).',
    keywordsEn: ['shellfish', 'shrimp', 'prawns', 'crab', 'lobster', 'crayfish', 'crawfish', 'langoustine', 'krill'],
    keywordsAr: ['قشريات', 'جمبري', 'روبيان', 'سرطان البحر', 'جراد البحر', 'كركند', 'قريدس'],
    excludeKeywords: [],
    triggers: ['Any crustacean species', 'Krill (used in supplements)', 'The generic word "shellfish"'],
    howSystemHandles: 'Matched separately from molluscs. Users allergic to crustaceans may not be allergic to molluscs and vice versa.',
    examples: [
      { scenario: 'Product contains "shrimp"', result: 'DETECTED', why: 'Direct crustacean keyword' },
      { scenario: 'Product contains "oyster"', result: 'NOT DETECTED for crustacean', why: 'Oyster is a mollusc, not a crustacean — would trigger shellfish_mollusc instead' },
    ],
  },
  {
    type: 'shellfish_mollusc',
    name: 'Shellfish (Mollusc)',
    nameAr: 'الرخويات',
    category: 'EU_14',
    severity: 'high',
    crossReactivity: 'mollusc',
    description: 'EU-required: covers mollusc species (oyster, mussel, squid, octopus). Separated from crustaceans per EU 1169/2011.',
    keywordsEn: ['mussel', 'mussels', 'clam', 'clams', 'oyster', 'oysters', 'scallop', 'scallops', 'squid', 'octopus', 'snail', 'abalone'],
    keywordsAr: ['محار', 'بلح البحر', 'حبار', 'أخطبوط', 'رخويات', 'سكالوب', 'حلزون'],
    excludeKeywords: [],
    triggers: ['Any mollusc species', 'Squid ink', 'Oyster sauce'],
    howSystemHandles: 'Separate allergen type from crustacean shellfish. Both fall under the seafood cross-reactivity group.',
    examples: [
      { scenario: 'Product contains "oyster sauce"', result: 'DETECTED', why: '"oyster" is a mollusc keyword' },
    ],
  },
  {
    type: 'tree_nuts',
    name: 'Tree Nuts',
    nameAr: 'المكسرات الشجرية',
    category: 'FDA_9',
    severity: 'high',
    crossReactivity: 'tree_nuts',
    description: 'Covers all tree nut species. Has critical exclude keywords to prevent false positives from &quot;nutmeg&quot; (a seed spice) and "coconut" (a drupe).',
    keywordsEn: ['almond', 'almonds', 'walnut', 'walnuts', 'cashew', 'cashews', 'pecan', 'pecans', 'pistachio', 'pistachios', 'hazelnut', 'hazelnuts', 'macadamia', 'brazil nut', 'pine nut', 'chestnut'],
    keywordsAr: ['لوز', 'جوز', 'كاجو', 'فستق', 'بندق', 'مكسرات', 'بيكان', 'مكاديميا', 'جوز برازيلي', 'صنوبر', 'كستناء', 'اللوز'],
    excludeKeywords: ['nutmeg', 'coconut', 'butternut', 'doughnut', 'donut', 'جوز الهند', 'جوزة الطيب'],
    triggers: ['Any tree nut species name', 'Products containing nut flours or oils', 'Arabic "جوز" (walnut) — but NOT "جوز الهند" (coconut) or "جوزة الطيب" (nutmeg)'],
    howSystemHandles: 'Exclude keywords prevent &quot;nutmeg&quot; (seed spice), "coconut" (drupe), and "butternut" (squash) from triggering tree nut detection. Arabic normalization converts ة→ه so "جوزة الطيب" also matches the exclude list.',
    examples: [
      { scenario: 'Product contains &quot;nutmeg&quot;', result: 'NOT DETECTED', why: '&quot;nutmeg&quot; is in the exclude list — it is a seed spice, not a tree nut' },
      { scenario: 'Product contains "coconut oil"', result: 'NOT DETECTED', why: '"coconut" is excluded — coconuts are drupes, not tree nuts' },
      { scenario: 'Product contains "almond milk"', result: 'DETECTED', why: '"almond" is a direct tree nut keyword' },
      { scenario: 'Product contains "جوزة الطيب" (nutmeg in Arabic)', result: 'NOT DETECTED', why: 'Arabic normalization ة→ه converts to "جوزه الطيب" which matches exclude entry' },
    ],
  },
  {
    type: 'peanuts',
    name: 'Peanuts',
    nameAr: 'الفول السوداني',
    category: 'FDA_9',
    severity: 'high',
    crossReactivity: 'legume',
    description: 'Peanuts are legumes, not tree nuts. Cross-reactive with soy and lupin (legume group). Detection priority is set higher than milk to ensure &quot;peanut butter&quot; is attributed to peanuts, not milk.',
    keywordsEn: ['peanut', 'peanuts', 'groundnut', 'groundnuts', 'arachis', 'goober'],
    keywordsAr: ['فول سوداني', 'فستق أرضي', 'الفول السوداني'],
    excludeKeywords: [],
    triggers: ['Peanut in any form', 'Groundnut (alternate name)', 'Arachis oil (scientific name)'],
    howSystemHandles: 'Peanuts has the HIGHEST detection priority. When &quot;peanut butter&quot; is encountered, it matches peanuts first (not milk from "butter"). This is enforced by the priority order in ALLERGEN_TAXONOMY.',
    examples: [
      { scenario: 'Product contains &quot;peanut butter&quot;', result: 'DETECTED as peanuts', why: 'Peanut is checked first (priority 1), so "peanut" matches before "butter" could match milk' },
      { scenario: 'Ingredient "فول سوداني"', result: 'DETECTED', why: 'Direct Arabic keyword match for peanuts' },
    ],
  },
  {
    type: 'wheat',
    name: 'Wheat',
    nameAr: 'القمح',
    category: 'FDA_9',
    severity: 'medium',
    crossReactivity: 'gluten',
    description: 'Covers wheat species and derivatives. Medically distinct from gluten intolerance (IgE-mediated vs. autoimmune). Has extensive exclude keywords to prevent false positives from buckwheat (a pseudocereal) and safe alternative flours.',
    keywordsEn: ['wheat', 'wheat flour', 'whole wheat', 'durum', 'semolina', 'spelt', 'kamut', 'farro', 'bulgur', 'couscous', 'seitan', 'einkorn', 'emmer', 'freekeh', 'triticale', 'wheat starch', 'wheat bran', 'wheat germ', 'wheat protein'],
    keywordsAr: ['قمح', 'دقيق القمح', 'القمح', 'جلوتين', 'الجلوتين', 'برغل', 'كسكس', 'سميد', 'فريكة', 'حنطة', 'الحنطة', 'نشا القمح'],
    excludeKeywords: ['buckwheat', 'black wheat flour', 'black wheat', 'gluten free', 'gluten-free', 'rice flour', 'corn flour', 'tapioca flour', 'potato flour', 'chickpea flour', 'حنطة سوداء', 'الحمطة السوداء', 'خالي من الجلوتين', 'بدون جلوتين', 'دقيق الأرز', 'دقيق الذرة', 'دقيق الحمص'],
    triggers: ['Any wheat species (durum, spelt, kamut, farro, emmer, einkorn)', 'Wheat derivatives (semolina, bulgur, couscous, freekeh)', 'Wheat starch, bran, germ, protein', 'Seitan (wheat gluten product)', 'Triticale (wheat-rye hybrid)'],
    howSystemHandles: 'Extensive exclusion list prevents false positives. "buckwheat" and "black wheat flour" (SFDA translation of buckwheat) are excluded because buckwheat is a pseudocereal (Fagopyrum), NOT wheat. Safe flours (rice, corn, tapioca, potato, chickpea) are excluded. "gluten free" label claims are excluded.',
    examples: [
      { scenario: 'Product contains "buckwheat flour"', result: 'NOT DETECTED', why: '"buckwheat" is excluded — it\'s a pseudocereal, not wheat' },
      { scenario: 'SFDA product with "black wheat flour" (الحمطة السوداء)', result: 'NOT DETECTED', why: '"black wheat flour" is excluded — SFDA translation of buckwheat' },
      { scenario: 'Product labeled "خالي من قمح وغلوتين" (free from wheat and gluten)', result: 'NOT DETECTED', why: '"خالي من الجلوتين" exclusion prevents false trigger from label claims' },
      { scenario: 'Product contains "semolina"', result: 'DETECTED', why: 'Semolina is milled durum wheat — direct wheat keyword' },
      { scenario: 'Product contains "rice flour"', result: 'NOT DETECTED', why: '"rice flour" is in the exclude list — it\'s a safe alternative' },
    ],
  },
  {
    type: 'gluten',
    name: 'Gluten',
    nameAr: 'الجلوتين',
    category: 'EU_14',
    severity: 'medium',
    crossReactivity: 'gluten',
    description: 'Covers gluten-containing grains: wheat, barley, rye, and oats (per EU 1169/2011). Medically distinct from wheat allergy — gluten intolerance/celiac is autoimmune, not IgE-mediated. Oats are included because they commonly cause issues for celiac patients unless certified gluten-free.',
    keywordsEn: ['gluten', 'barley', 'rye', 'malt', 'malt extract', 'malt vinegar', 'brewer yeast', 'seitan', 'triticale', 'barley malt', 'barley flour', 'rye flour', 'malt syrup', 'oat', 'oats', 'oat flour', 'oat bran'],
    keywordsAr: ['جلوتين', 'الجلوتين', 'غلوتين', 'شعير', 'الشعير', 'جاودار', 'شيلم', 'مالت', 'سيتان', 'خميرة البيرة', 'شوفان', 'الشوفان', 'دقيق الشوفان'],
    excludeKeywords: ['gluten free', 'gluten-free', 'gluten free oats', 'gluten-free oats', 'خالي من الجلوتين', 'بدون جلوتين'],
    triggers: ['Barley and barley derivatives (malt, malt extract)', 'Rye flour', 'Oats (unless labeled &quot;gluten-free oats&quot;)', 'Malt vinegar, malt syrup', "Brewer's yeast", 'Seitan (pure wheat gluten)'],
    howSystemHandles: 'User with Wheat allergy → only wheat keywords checked, barley/rye NOT flagged. User with Gluten allergy → barley, rye, malt, oats all flagged. "Gluten free oats" are excluded because certified GF oats are safe for most celiac patients.',
    examples: [
      { scenario: 'Product contains "barley malt"', result: 'DETECTED for Gluten, NOT for Wheat', why: 'Barley is a gluten keyword, not a wheat keyword' },
      { scenario: 'Product contains "oat flour"', result: 'DETECTED for Gluten', why: 'Oats are included in gluten per EU 1169/2011' },
      { scenario: 'Product contains &quot;gluten-free oats&quot;', result: 'NOT DETECTED', why: '&quot;gluten-free oats&quot; is in the exclude list — certified GF oats are safe' },
      { scenario: 'User has Wheat allergy, product has barley', result: 'NOT DETECTED', why: 'Wheat allergy ≠ gluten intolerance — barley only triggers Gluten type' },
    ],
  },
  {
    type: 'soy',
    name: 'Soy',
    nameAr: 'فول الصويا',
    category: 'FDA_9',
    severity: 'medium',
    crossReactivity: 'legume',
    description: 'Covers soy/soya and derivatives. Cross-reactive with peanuts and lupin (legume group). E322 (lecithin) is NOT automatically mapped to soy — only &quot;soy lecithin&quot; triggers, since lecithin can be derived from sunflower or egg.',
    keywordsEn: ['soy', 'soya', 'soybean', 'soybeans', 'tofu', 'edamame', 'miso', 'tempeh', 'soy sauce', 'lecithin', 'soy lecithin', 'soy protein', 'soy flour', 'soybean oil', 'soy milk'],
    keywordsAr: ['صويا', 'فول الصويا', 'الصويا', 'توفو', 'ليسيثين الصويا', 'بروتين الصويا', 'زيت الصويا'],
    excludeKeywords: [],
    triggers: ['Soy protein or flour', 'Soy sauce, miso, tempeh', 'Explicit &quot;soy lecithin&quot; (but NOT generic "lecithin" or "E322")'],
    howSystemHandles: 'E322 is intentionally NOT mapped to soy because lecithin can be derived from sunflower, rapeseed, or egg. Only when the ingredient explicitly says &quot;soy lecithin&quot; does it trigger soy detection.',
    examples: [
      { scenario: 'Product contains &quot;soy lecithin&quot;', result: 'DETECTED', why: 'Explicit soy lecithin keyword' },
      { scenario: 'Product contains "lecithin (E322)"', result: 'NOT DETECTED for soy', why: 'Generic lecithin/E322 could be sunflower-derived — conservative handling' },
      { scenario: 'Product contains "edamame"', result: 'DETECTED', why: 'Edamame is immature soybeans — direct keyword' },
    ],
  },
  {
    type: 'sesame',
    name: 'Sesame',
    nameAr: 'السمسم',
    category: 'FDA_9',
    severity: 'high',
    crossReactivity: 'sesame',
    description: 'Added to FDA major allergens in 2023 (FASTER Act). Covers sesame seeds, oil, and derived products like tahini and halva.',
    keywordsEn: ['sesame', 'tahini', 'tahina', 'sesamum', 'benne', 'gingelly', 'til', 'sesame oil', 'sesame seeds', 'halva'],
    keywordsAr: ['سمسم', 'السمسم', 'طحينة', 'الطحينة', 'زيت السمسم', 'بذور السمسم', 'طحينية'],
    excludeKeywords: [],
    triggers: ['Sesame seeds or oil', 'Tahini/tahina (sesame paste)', 'Halva (sesame-based confection)', 'Benne/gingelly/til (regional names)'],
    howSystemHandles: 'Multiple regional names are covered. Halva is included because it is primarily sesame-based in GCC/Middle Eastern products.',
    examples: [
      { scenario: 'Product contains "طحينة" (tahina)', result: 'DETECTED', why: 'Tahina is sesame paste — direct Arabic keyword' },
      { scenario: 'Product contains "halva"', result: 'DETECTED', why: 'Halva is a sesame-based confection' },
    ],
  },
  {
    type: 'celery',
    name: 'Celery',
    nameAr: 'الكرفس',
    category: 'EU_14',
    severity: 'low',
    crossReactivity: 'celery',
    description: 'EU-required allergen. Less common in GCC market but included for EU compliance. Covers celery root (celeriac), seeds, and salt.',
    keywordsEn: ['celery', 'celeriac', 'celery seed', 'celery salt', 'celery powder', 'celery extract'],
    keywordsAr: ['كرفس', 'الكرفس', 'بذور الكرفس'],
    excludeKeywords: [],
    triggers: ['Celery in any form', 'Celeriac (celery root)', 'Celery seed/salt/powder used as seasoning'],
    howSystemHandles: 'Standard keyword matching. Low severity classification.',
    examples: [
      { scenario: 'Product contains "celery salt"', result: 'DETECTED', why: 'Direct keyword match' },
    ],
  },
  {
    type: 'mustard',
    name: 'Mustard',
    nameAr: 'الخردل',
    category: 'EU_14',
    severity: 'low',
    crossReactivity: 'mustard',
    description: 'EU-required allergen. Covers mustard seeds, powder, oil, and prepared mustard products.',
    keywordsEn: ['mustard', 'mustard seed', 'dijon', 'mustard powder', 'mustard flour', 'mustard oil', 'yellow mustard'],
    keywordsAr: ['خردل', 'الخردل', 'بذور الخردل', 'ديجون'],
    excludeKeywords: [],
    triggers: ['Mustard in any form', 'Dijon (mustard variety)', 'Mustard oil or powder'],
    howSystemHandles: 'Standard keyword matching. "Dijon" specifically added as a mustard variety.',
    examples: [
      { scenario: 'Product contains "dijon mustard"', result: 'DETECTED', why: '"dijon" and "mustard" are both mustard keywords' },
    ],
  },
  {
    type: 'lupin',
    name: 'Lupin',
    nameAr: 'الترمس',
    category: 'EU_14',
    severity: 'medium',
    crossReactivity: 'legume',
    description: 'EU-required allergen. Cross-reactive with peanuts (legume group). Lupin flour is increasingly used in gluten-free products as a wheat flour substitute.',
    keywordsEn: ['lupin', 'lupine', 'lupin flour'],
    keywordsAr: ['ترمس', 'الترمس', 'دقيق الترمس', 'بذور الترمس'],
    excludeKeywords: [],
    triggers: ['Lupin seeds or flour', 'Found in some gluten-free bread and pasta as wheat flour substitute'],
    howSystemHandles: 'Part of the legume cross-reactivity group (with peanuts and soy). Users with peanut allergy should be aware of potential cross-reactivity.',
    examples: [
      { scenario: 'Gluten-free bread contains "lupin flour"', result: 'DETECTED', why: 'Direct keyword match — lupin flour used as GF substitute' },
    ],
  },
  {
    type: 'sulfites',
    name: 'Sulfites',
    nameAr: 'الكبريتيت',
    category: 'EU_14',
    severity: 'medium',
    crossReactivity: 'sulfites',
    description: 'Preservative compounds (E220-E228). Required labeling when concentration exceeds 10 mg/kg. Common in dried fruits, wine, and processed foods.',
    keywordsEn: ['sulfite', 'sulfites', 'sulphite', 'sulphites', 'sulfur dioxide', 'sulphur dioxide', 'metabisulfite', 'bisulfite', 'sodium sulfite', 'sodium bisulfite', 'sodium metabisulfite', 'potassium bisulfite', 'potassium metabisulfite', 'calcium sulfite', 'E220', 'E221', 'E222', 'E223', 'E224', 'E225', 'E226', 'E227', 'E228'],
    keywordsAr: ['كبريتات', 'كبريتيت', 'ثاني أكسيد الكبريت', 'ميتابيسلفيت', 'بيسلفيت', 'كبريتيت الصوديوم'],
    excludeKeywords: [],
    triggers: ['E-numbers E220 through E228', 'Sulfur/sulphur dioxide', 'Any bisulfite/metabisulfite compound', 'Both British (sulphite) and American (sulfite) spellings'],
    howSystemHandles: 'Full E-number range E220-E228 mapped. Both American (sulfite) and British (sulphite) spelling variants covered.',
    examples: [
      { scenario: 'Product contains "E223"', result: 'DETECTED', why: 'E223 (sodium metabisulfite) is mapped to sulfites' },
      { scenario: 'Product contains "preservative: sulphur dioxide"', result: 'DETECTED', why: '"sulphur dioxide" matches sulfites keyword (British spelling)' },
    ],
  },
]

const severityColors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
}

const categoryColors = {
  FDA_9: 'bg-red-50 text-red-600',
  EU_14: 'bg-blue-50 text-blue-600',
}

function AllergenCard({ allergen }: { allergen: AllergenGuide }) {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations('guides')

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-3">
            <span>{allergen.name}</span>
            <span className="text-muted-foreground font-normal text-sm">({allergen.nameAr})</span>
            <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[allergen.category]}`}>
              {allergen.category.replace('_', ' ')}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded border ${severityColors[allergen.severity]}`}>
              {t(`severity_${allergen.severity}`)}
            </span>
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </CardTitle>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-4 border-t pt-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground">{t(`allergen_${allergen.type}_desc`)}</p>

          {/* Keywords */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <Search className="h-3.5 w-3.5" /> {t('keywordsEn')}
            </h4>
            <div className="flex flex-wrap gap-1">
              {allergen.keywordsEn.map(kw => (
                <code key={kw} className="text-xs bg-muted px-1.5 py-0.5 rounded">{kw}</code>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">{t('keywordsAr')}</h4>
            <div className="flex flex-wrap gap-1" dir="rtl">
              {allergen.keywordsAr.map(kw => (
                <code key={kw} className="text-xs bg-muted px-1.5 py-0.5 rounded">{kw}</code>
              ))}
            </div>
          </div>

          {/* Exclude Keywords */}
          {allergen.excludeKeywords.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5 text-red-500" /> {t('excludeKeywords')}
              </h4>
              <div className="flex flex-wrap gap-1">
                {allergen.excludeKeywords.map(kw => (
                  <code key={kw} className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-200">{kw}</code>
                ))}
              </div>
            </div>
          )}

          {/* Triggers */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-yellow-500" /> {t('triggers')}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              {allergen.triggers.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>

          {/* How System Handles */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-blue-500" /> {t('howSystemHandles')}
            </h4>
            <p className="text-sm text-muted-foreground">{t(`allergen_${allergen.type}_handles`)}</p>
          </div>

          {/* Examples */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-indigo-500" /> {t('practicalExamples')}
            </h4>
            <div className="space-y-2">
              {allergen.examples.map((ex, i) => (
                <div key={i} className="text-sm border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-start gap-2">
                    {ex.result.includes('NOT') ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">{ex.scenario}</p>
                      <p className="text-muted-foreground">
                        {t('result')}: <span className={ex.result.includes('NOT') ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{ex.result}</span>
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">{ex.why}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-reactivity */}
          <div className="text-xs text-muted-foreground border-t pt-2">
            {t('crossReactivityGroup')}: <code className="bg-muted px-1 rounded">{allergen.crossReactivity}</code>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function SensitivityTypesGuide() {
  const t = useTranslations('guides')
  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('howDetectionWorks')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t('detectionPipeline')}</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>{t('step1Normalize')}</li>
                <li>{t('step2Tokenize')}</li>
                <li>{t('step3Exclude')}</li>
                <li>{t('step4Exact')}</li>
                <li>{t('step5Token')}</li>
                <li>{t('step6Taxonomy')}</li>
              </ol>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t('resultStates')}</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <strong>{t('confirmedPresent')}</strong> — {t('confirmedPresentDesc')}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <strong>{t('precautionaryWarning')}</strong> — {t('precautionaryWarningDesc')}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <strong>{t('unclear')}</strong> — {t('unclearDesc')}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <strong>{t('notDetected')}</strong> — {t('notDetectedDesc')}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-gray-400" />
                  <strong>{t('sourceMissing')}</strong> — {t('sourceMissingDesc')}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2">{t('safetyPrinciples')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t('principle1')}</li>
              <li>{t('principle2')}</li>
              <li>{t('principle3')}</li>
              <li>{t('principle4')}</li>
              <li>{t('principle5')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Allergen List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t('all15Types')}</h3>
        <div className="flex gap-3 text-sm mb-2">
          <span className="flex items-center gap-1">
            <span className={`text-xs px-2 py-0.5 rounded ${categoryColors.FDA_9}`}>{t('fda9')}</span>
            {t('fdaLabel')}
          </span>
          <span className="flex items-center gap-1">
            <span className={`text-xs px-2 py-0.5 rounded ${categoryColors.EU_14}`}>{t('eu14')}</span>
            {t('euLabel')}
          </span>
        </div>
        {ALLERGEN_GUIDES.map(allergen => (
          <AllergenCard key={allergen.type} allergen={allergen} />
        ))}
      </div>
    </div>
  )
}

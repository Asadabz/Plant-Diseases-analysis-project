// Calls the real FastAPI backend (/predict) and enriches the raw model
// prediction with human-readable disease info (symptoms, treatment,
// prevention) so the existing UI components keep working unchanged.

import { compressImage } from './imagescompress';

export interface DetectionResult {
  diseaseName: string;
  confidence: number;
  severity: 'Mild' | 'Moderate' | 'Severe';
  affectedArea: number;
  affectedPlants: string[];
  description: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  isHealthy: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface PredictResponse {
  disease: string;
  confidence: number;
  top3: { disease: string; confidence: number }[];
}

type KnowledgeEntry = Omit<DetectionResult, 'diseaseName' | 'confidence' | 'affectedArea' | 'isHealthy'> & {
  diseaseName: string;
  isHealthy: boolean;
};

const knowledgeBase: Record<string, KnowledgeEntry> = {
  healthy: {
    diseaseName: 'Healthy Leaf',
    severity: 'Mild',
    affectedPlants: ['All plants'],
    description: 'No signs of disease detected. The leaf structure, coloration, and venation appear normal and healthy.',
    symptoms: ['Uniform green coloration', 'Absence of lesions or spots', 'Firm, turgid leaf texture', 'Normal shape and size'],
    treatment: ['No treatment required', 'Continue regular care', 'Monitor periodically', 'Maintain current watering schedule'],
    prevention: ['Maintain balanced fertilization', 'Ensure proper sunlight exposure', 'Water appropriately for the plant species', 'Inspect plants weekly for early signs of pests'],
    isHealthy: true,
  },
  lateBlight: {
    diseaseName: 'Late Blight',
    severity: 'Severe',
    affectedPlants: ['Tomato', 'Potato'],
    description: 'A devastating disease caused by the oomycete Phytophthora infestans. It spreads rapidly in cool, wet conditions.',
    symptoms: ['Irregular, dark, water-soaked lesions on leaves', 'White fungal growth on the underside of leaves', 'Brown to black spots on stems', 'Rapid defoliation and plant death'],
    treatment: ['Apply copper-based fungicides immediately', 'Remove and destroy infected plant parts', 'Do not compost infected material', 'Apply appropriate systemic fungicides if available'],
    prevention: ['Plant resistant varieties', 'Ensure proper spacing for air circulation', 'Water at the base of the plant to keep leaves dry', 'Practice crop rotation (3-4 years)'],
    isHealthy: false,
  },
  earlyBlight: {
    diseaseName: 'Early Blight',
    severity: 'Moderate',
    affectedPlants: ['Tomato', 'Potato', 'Celery'],
    description: 'A common fungal disease caused by Alternaria solani, producing target-like spots that expand as the season progresses.',
    symptoms: ['Brown spots with concentric rings on older leaves', 'Yellowing around the lesions', 'Leaves wither and drop starting from the bottom', 'Dark lesions on stems near the soil line'],
    treatment: ['Apply chlorothalonil or copper-based fungicide', 'Remove and destroy affected lower leaves', 'Improve airflow by staking and pruning', 'Avoid overhead watering'],
    prevention: ['Rotate crops out of the nightshade family for 2 years', 'Mulch to reduce soil splash onto leaves', 'Use certified disease-free seed/seedlings', 'Keep plants well-fertilized to resist stress'],
    isHealthy: false,
  },
  bacterialSpot: {
    diseaseName: 'Bacterial Leaf Spot',
    severity: 'Moderate',
    affectedPlants: ['Pepper', 'Tomato', 'Lettuce'],
    description: 'A bacterial disease that causes small, water-soaked spots on leaves that eventually turn brown or black.',
    symptoms: ['Small, water-soaked spots on lower leaves', 'Spots enlarge and turn dark brown', 'Yellow halos around lesions', 'Leaves may turn yellow and drop'],
    treatment: ['Apply copper-based bactericides', 'Remove heavily infected leaves', 'Avoid handling plants when wet', 'Destroy severely infected plants'],
    prevention: ['Use certified disease-free seeds', 'Practice crop rotation', 'Control weeds that may harbor bacteria', 'Sanitize garden tools regularly'],
    isHealthy: false,
  },
  septoria: {
    diseaseName: 'Septoria Leaf Spot',
    severity: 'Moderate',
    affectedPlants: ['Tomato', 'Celery'],
    description: 'A destructive fungal disease causing numerous small circular spots, usually starting on the lower leaves.',
    symptoms: ['Small circular spots with dark borders and gray centers', 'Tiny black specks (pycnidia) in the center of spots', 'Yellowing of heavily spotted leaves', 'Significant defoliation'],
    treatment: ['Apply copper or fungicidal sprays immediately', 'Remove bottom leaves to slow spread', 'Stake plants to keep leaves off ground', 'Apply mulch to prevent splash up'],
    prevention: ['Space plants generously', 'Rotate crops yearly', 'Clean up all garden debris at end of season', 'Water at the base using drip irrigation'],
    isHealthy: false,
  },
  leafSpot: {
    diseaseName: 'Cercospora Leaf Spot',
    severity: 'Mild',
    affectedPlants: ['Sugar beet', 'Corn', 'Soybean', 'Eggplant', 'Grape', 'Cucumber', 'Ginger'],
    description: 'A fungal disease causing circular spots with gray centers and dark borders. Common in warm, humid weather.',
    symptoms: ['Small circular spots with light gray centers', 'Dark brown to purple borders around spots', 'Yellowing of entire leaf in severe cases', 'Defoliation starting from bottom leaves'],
    treatment: ['Apply preventative fungicides early in season', 'Remove affected leaves to reduce inoculum', 'Apply copper or chlorothalonil-based sprays', 'Maintain optimal plant nutrition'],
    prevention: ['Deep plow crop residue', 'Practice a 2-3 year crop rotation', 'Control volunteer plants and weeds', 'Ensure balanced soil fertility'],
    isHealthy: false,
  },
  targetSpot: {
    diseaseName: 'Target Spot',
    severity: 'Moderate',
    affectedPlants: ['Tomato'],
    description: 'A fungal disease caused by Corynespora cassiicola, producing target-like brown lesions on leaves and fruit.',
    symptoms: ['Brown lesions with concentric target-like rings', 'Lesions merge to form large necrotic patches', 'Premature yellowing and leaf drop', 'Sunken spots may appear on fruit'],
    treatment: ['Apply broad-spectrum fungicide at first sign', 'Remove and destroy infected foliage', 'Improve air circulation around plants', 'Avoid working in fields when leaves are wet'],
    prevention: ['Rotate crops away from host plants', 'Avoid dense planting', 'Water at the base, not overhead', 'Sanitize tools between plants'],
    isHealthy: false,
  },
  powderyMildew: {
    diseaseName: 'Powdery Mildew',
    severity: 'Moderate',
    affectedPlants: ['Squash', 'Cucumber', 'Roses', 'Wheat', 'Cherry'],
    description: 'A common fungal disease characterized by white, powdery spots on leaves and stems. It thrives in high humidity and moderate temperatures.',
    symptoms: ['White to gray powdery patches on leaf surfaces', 'Yellowing and curling of infected leaves', 'Stunted plant growth', 'Premature leaf drop'],
    treatment: ['Apply sulfur or potassium bicarbonate fungicides', 'Use neem oil or horticultural oils', 'Prune affected areas to improve airflow', 'Apply baking soda solution'],
    prevention: ['Plant in full sun', 'Provide adequate spacing between plants', 'Avoid overhead watering', 'Use resistant varieties when possible'],
    isHealthy: false,
  },
  downyMildew: {
    diseaseName: 'Downy Mildew',
    severity: 'Severe',
    affectedPlants: ['Grapes', 'Cucurbits', 'Basil', 'Lettuce', 'Broccoli'],
    description: 'An oomycete disease causing yellowing on top of leaves and fuzzy growth underneath, thriving in cool, wet weather.',
    symptoms: ['Pale green to yellow spots on upper leaf surfaces', 'Purplish-gray fuzzy growth on leaf undersides', 'Leaves turn brown and brittle', 'Stunted shoot growth'],
    treatment: ['Apply specific systemic fungicides', 'Remove affected plant parts immediately', 'Improve drainage around roots', 'Harvest early if crop is near maturity'],
    prevention: ['Increase air flow with aggressive pruning', 'Water early in the day', 'Use resistant cultivars', 'Avoid dense planting'],
    isHealthy: false,
  },
  rust: {
    diseaseName: 'Leaf Rust',
    severity: 'Moderate',
    affectedPlants: ['Wheat', 'Corn', 'Roses', 'Coffee', 'Apple', 'Bean', 'Blueberry', 'Garlic'],
    description: 'A fungal disease that produces rust-colored pustules on leaves, reducing plant vigor and yield.',
    symptoms: ['Orange, brown, or red powdery spots on leaves', 'Yellowing of surrounding leaf tissue', 'Premature leaf drop in severe cases', 'Stunted growth and reduced yields'],
    treatment: ['Apply appropriate chemical fungicides', 'Remove and destroy infected leaves', 'Apply neem oil for mild infections', 'Ensure plants are well-fertilized to resist stress'],
    prevention: ['Plant rust-resistant varieties', 'Avoid overhead watering', 'Clean up garden debris in fall', 'Space plants for good air circulation'],
    isHealthy: false,
  },
  scab: {
    diseaseName: 'Scab',
    severity: 'Moderate',
    affectedPlants: ['Apple', 'Pear'],
    description: 'A fungal disease (Venturia spp.) causing dark, scabby lesions on leaves and fruit, favored by cool wet spring weather.',
    symptoms: ['Olive-green to black velvety spots on leaves', 'Scabby, corky lesions on fruit surface', 'Premature leaf yellowing and drop', 'Distorted or cracked fruit'],
    treatment: ['Apply fungicide starting at bud break', 'Rake and destroy fallen leaves each autumn', 'Prune to improve canopy airflow', 'Thin fruit to reduce humidity around clusters'],
    prevention: ['Plant scab-resistant varieties', 'Avoid overhead irrigation', 'Maintain good sanitation each fall', 'Space trees for adequate airflow'],
    isHealthy: false,
  },
  blackRot: {
    diseaseName: 'Black Rot',
    severity: 'Severe',
    affectedPlants: ['Grape', 'Apple', 'Cabbage'],
    description: 'A fungal or bacterial disease causing dark, sunken lesions and rot, capable of destroying entire fruit clusters.',
    symptoms: ['Circular brown lesions with dark borders on leaves', 'Black, shriveled "mummified" fruit', 'Dark streaks on shoots and tendrils', 'Premature defoliation'],
    treatment: ['Apply fungicide on a preventative schedule', 'Remove mummified fruit and cankered wood', 'Prune out infected canes', 'Destroy all infected plant debris'],
    prevention: ['Prune for an open, airy canopy', 'Clean up fallen leaves and fruit each season', 'Avoid wetting foliage late in the day', 'Choose resistant cultivars where available'],
    isHealthy: false,
  },
  mites: {
    diseaseName: 'Spider Mites',
    severity: 'Moderate',
    affectedPlants: ['Tomato', 'Beans', 'Many ornamentals'],
    description: 'Damage from spider mites — tiny pests that pierce leaf cells and feed on plant sap, especially in hot, dry weather.',
    symptoms: ['Fine yellow or white stippling on leaves', 'Pale, bronzed, or speckled leaf appearance', 'Fine webbing on the underside of leaves', 'Leaf curling and premature drop in heavy infestations'],
    treatment: ['Spray leaves (especially undersides) with water to dislodge mites', 'Apply insecticidal soap or neem oil', 'Introduce predatory mites for biological control', 'Avoid broad-spectrum insecticides that kill natural predators'],
    prevention: ['Keep plants well-watered — mites favor drought-stressed plants', 'Avoid excess nitrogen fertilizer', 'Regularly hose down foliage to disrupt mite populations', 'Inspect new plants before introducing them to the garden'],
    isHealthy: false,
  },
  anthracnose: {
    diseaseName: 'Anthracnose',
    severity: 'Moderate',
    affectedPlants: ['Beans', 'Tomatoes', 'Trees', 'Strawberry', 'Celery'],
    description: 'A fungal disease causing dark, sunken lesions on leaves, stems, and fruits.',
    symptoms: ['Small irregular yellow or brown spots', 'Dark sunken lesions with pinkish centers on fruit', 'Dieback of twigs and branches', 'Premature leaf drop'],
    treatment: ['Apply copper fungicides', 'Prune and destroy infected branches', 'Remove infected fruits', 'Apply dormant sprays in winter for trees'],
    prevention: ['Buy disease-free seed', 'Avoid overhead irrigation', 'Apply mulch to prevent soil splashing', 'Sanitize tools after use'],
    isHealthy: false,
  },
  wilt: {
    diseaseName: 'Verticillium Wilt',
    severity: 'Severe',
    affectedPlants: ['Tomatoes', 'Potatoes', 'Strawberries'],
    description: 'A soil-borne fungal disease that attacks the vascular system, preventing water transport.',
    symptoms: ['Wilting of lower leaves, often on one side', 'V-shaped yellow lesions at leaf margins', 'Brown discoloration inside the stem', 'Gradual plant death'],
    treatment: ['No chemical cure exists for infected plants', 'Remove and destroy entire plant including roots', 'Do not compost infected plants', 'Solarize soil if possible'],
    prevention: ['Plant resistant varieties (V-rated)', 'Practice long crop rotations (4-5 years)', 'Ensure good soil drainage', 'Control root-knot nematodes which exacerbate the disease'],
    isHealthy: false,
  },
  alternaria: {
    diseaseName: 'Alternaria Leaf Blight',
    severity: 'Moderate',
    affectedPlants: ['Carrots', 'Cabbage', 'Tomatoes', 'Cauliflower'],
    description: 'A fungal disease causing dark brown to black spots with concentric rings, often resembling a target.',
    symptoms: ['Dark spots with target-like concentric rings', 'Yellow halos around spots', 'Lesions on stems and fruits', 'Defoliation starting from oldest leaves'],
    treatment: ['Apply broad-spectrum fungicides', 'Remove infected leaves promptly', 'Ensure adequate nitrogen fertility', 'Apply chlorothalonil sprays'],
    prevention: ['Use disease-free seed', 'Plow under crop debris', 'Rotate crops out of host families', 'Avoid working in wet fields'],
    isHealthy: false,
  },
  mosaicVirus: {
    diseaseName: 'Mosaic Virus',
    severity: 'Severe',
    affectedPlants: ['Cucumbers', 'Tomatoes', 'Peppers', 'Bean', 'Lettuce', 'Tobacco', 'Zucchini', 'Apple'],
    description: 'A viral infection transmitted by aphids or mechanical means, causing mottled foliage and stunted growth.',
    symptoms: ['Mottled light and dark green patterns on leaves', 'Stunted and distorted plant growth', 'Wrinkled or curled foliage', 'Poor fruit yield and deformed fruits'],
    treatment: ['No cure for infected plants', 'Remove and destroy infected plants immediately', 'Control aphid populations to prevent spread', 'Wash hands and tools thoroughly'],
    prevention: ['Control insect vectors with reflective mulches', 'Use virus-resistant cultivars', 'Remove weeds that act as virus reservoirs', 'Do not smoke around plants (Tobacco Mosaic Virus)'],
    isHealthy: false,
  },
  yellowLeafCurl: {
    diseaseName: 'Yellow Leaf Curl Virus',
    severity: 'Severe',
    affectedPlants: ['Tomato'],
    description: 'A whitefly-transmitted viral disease that severely stunts growth and curls leaves upward.',
    symptoms: ['Upward curling and cupping of leaves', 'Yellowing between leaf veins', 'Severely stunted plant growth', 'Drastically reduced flowering and fruit set'],
    treatment: ['No cure once infected — remove and destroy infected plants', 'Control whitefly populations with insecticidal soap or yellow sticky traps', 'Avoid planting near infected fields'],
    prevention: ['Use virus-resistant tomato varieties', 'Use reflective mulch to repel whiteflies', 'Install fine mesh screens in greenhouses', 'Remove and destroy crop debris after harvest'],
    isHealthy: false,
  },

  // ===== Newly researched entries =====
  haloBlight: {
    diseaseName: 'Halo Blight',
    severity: 'Moderate',
    affectedPlants: ['Bean'],
    description: 'A seed-borne bacterial disease caused by Pseudomonas syringae pv. phaseolicola, most destructive in cool, humid conditions (16-24°C).',
    symptoms: ['Small water-soaked spots on the underside of leaves', 'Necrotic lesions surrounded by a yellow "halo"', 'Leaf distortion on expanding leaves', 'Water-soaked, rust-colored lesions on pods'],
    treatment: ['Apply copper-based bactericides to suppress spread', 'Remove and destroy severely infected plants', 'Avoid working in fields when foliage is wet', 'Use furrow or drip irrigation instead of overhead'],
    prevention: ['Plant certified, disease-free seed', 'Use resistant bean varieties where available', 'Rotate to non-host crops for 2-4 years', 'Promptly remove and decompose bean debris after harvest'],
    isHealthy: false,
  },
  sheathBlight: {
    diseaseName: 'Sheath Blight',
    severity: 'Severe',
    affectedPlants: ['Rice', 'Ginger', 'Soybean', 'Corn', 'Sugarcane'],
    description: 'A major fungal disease of rice caused by Rhizoctonia solani, thriving in dense canopies with high humidity (85-100%) and heavy nitrogen fertilization.',
    symptoms: ['Oval, greenish-grey water-soaked lesions on leaf sheaths near the waterline', 'Lesions enlarge with grey-white centers and brown/purple borders', 'Hard fungal survival structures (sclerotia) visible on infected tissue', 'Lodging (plants falling over) and poor grain filling'],
    treatment: ['Apply labeled fungicides (e.g. hexaconazole, propiconazole) once threshold incidence is reached', 'Avoid excessive nitrogen application, especially at internode elongation', 'Drain fields temporarily to reduce canopy humidity if possible'],
    prevention: ['Plant less-susceptible, high-yielding varieties', 'Maintain optimal plant spacing (avoid overly dense stands)', 'Time nitrogen applications carefully — avoid heavy late-season doses', 'Remove infected plant debris and weed hosts after harvest'],
    isHealthy: false,
  },
  riceBlast: {
    diseaseName: 'Rice Blast',
    severity: 'Severe',
    affectedPlants: ['Rice'],
    description: 'One of the most devastating rice diseases worldwide, caused by the fungus Magnaporthe oryzae, which can infect leaves, stems, nodes, and panicles.',
    symptoms: ['Small bluish-green flecks that enlarge into spindle-shaped lesions', 'Lesions with grey/white centers and dark brown or reddish margins', 'Spots coalesce to form large, irregular burnt-looking patches', 'Black lesions girdling nodes, causing stems to break'],
    treatment: ['Apply registered fungicides at critical stages (panicle initiation, heading)', 'Use seed treatment with appropriate fungicide before planting', 'Avoid excess nitrogen fertilization which increases susceptibility'],
    prevention: ['Use certified, disease-free seed or resistant cultivars', 'Practice balanced fertilization and proper field sanitation', 'Maintain good field drainage and avoid prolonged leaf wetness', 'Remove and destroy infected crop residue and stubble'],
    isHealthy: false,
  },
  tarSpot: {
    diseaseName: 'Tar Spot',
    severity: 'Mild',
    affectedPlants: ['Maple'],
    description: 'A common, primarily cosmetic fungal disease of maple trees caused by Rhytisma species, rarely causing serious harm to tree health.',
    symptoms: ['Small yellow-green spots appearing on upper leaf surface in early summer', 'Spots enlarge and turn raised, shiny, black, and tar-like by late summer', 'Narrow yellow margin around the black spots', 'Slightly premature leaf fall in heavily affected trees'],
    treatment: ['Treatment is rarely warranted as this is mostly a cosmetic disease', 'Copper or mancozeb-based fungicide sprays can be used in persistent/severe cases', 'A certified arborist can advise on professional treatment if needed'],
    prevention: ['Rake and destroy fallen leaves every autumn — the single most effective control', 'Improve drainage and reduce excess moisture around the tree', 'No long-term impact on tree vigor, so action is mainly aesthetic'],
    isHealthy: false,
  },
  leafrollDisease: {
    diseaseName: 'Grapevine Leafroll Disease',
    severity: 'Severe',
    affectedPlants: ['Grape'],
    description: 'A complex viral disease of grapevines caused by Grapevine Leafroll-Associated Viruses (GLRaVs), spread by mealybugs, soft scale insects, and infected propagation material.',
    symptoms: ['Downward curling/rolling of leaf margins', 'Red to purple inter-veinal discoloration on red varieties (veins stay green)', 'Yellowing between veins on white varieties', 'Reduced vigor, delayed/uneven fruit ripening, and lower yield'],
    treatment: ['No cure exists once a vine is infected', 'Remove and destroy confirmed virus-infected vines', 'Disinfect pruning tools with bleach between vines to limit spread'],
    prevention: ['Plant only virus-tested, certified planting material from reputable nurseries', 'Control mealybug and soft scale populations (primary vectors)', 'Avoid taking cuttings/budwood from vines of unknown health status'],
    isHealthy: false,
  },
  bacterialWilt: {
    diseaseName: 'Bacterial Wilt',
    severity: 'Severe',
    affectedPlants: ['Cucumber', 'Squash', 'Pumpkin'],
    description: 'A serious disease of cucurbits caused by the bacterium Erwinia tracheiphila, transmitted almost exclusively by striped and spotted cucumber beetles.',
    symptoms: ['Dull green color followed by progressive wilting of individual leaves/runners', 'Rapid wilting and collapse of entire vines', 'Bacterial ooze visible when a cut stem is slowly pulled apart (string test)', 'Young plants can die within two weeks of first symptoms'],
    treatment: ['No cure once a plant is infected — remove and destroy infected plants immediately', 'Do not compost infected vines', 'Copper sprays are NOT effective since the bacterium spreads systemically inside the plant'],
    prevention: ['Control cucumber beetles aggressively — this is the only effective prevention', 'Use floating row covers on young seedlings, removing them once flowers appear for pollination', 'Choose bacterial-wilt-resistant varieties where available', 'Eliminate weeds and volunteer cucurbit plants nearby'],
    isHealthy: false,
  },
  leafCurl: {
    diseaseName: 'Peach Leaf Curl',
    severity: 'Moderate',
    affectedPlants: ['Peach'],
    description: 'A fungal disease caused by Taphrina deformans that distorts and discolors developing peach leaves in early spring.',
    symptoms: ['Reddish, puckered areas on young developing leaves', 'Leaves become progressively distorted and curled', 'Severely infected leaves turn reddish-yellow or powdery grey', 'Premature leaf drop, weakening the tree over successive years if untreated'],
    treatment: ['Apply a copper-based fungicide spray — most effective as a single well-timed application in early spring before bud break', 'Severely affected leaves cannot be cured once curled; focus on next season\u2019s prevention'],
    prevention: ['One thorough fungicide spray during dormancy (after leaf fall, before bud swell) usually prevents the disease for the season', 'Choose leaf-curl-resistant peach/nectarine varieties where available', 'Avoid excess overhead irrigation that keeps buds wet for long periods'],
    isHealthy: false,
  },
  leafScorch: {
    diseaseName: 'Strawberry Leaf Scorch',
    severity: 'Moderate',
    affectedPlants: ['Strawberry'],
    description: 'One of the most common strawberry leaf diseases, caused by the fungus Diplocarpon earlianum, favored by warm (20-30°C), wet weather.',
    symptoms: ['Numerous small, irregular purplish spots on the upper leaf surface', 'Spots lack a sharply defined border (unlike common leaf spot)', 'Affected leaf tissue turns red to brown and dries out', 'Leaf margins curl upward, giving a "scorched" appearance'],
    treatment: ['Apply labeled fungicides, especially during prolonged wet periods', 'Remove and destroy heavily infected leaves after harvest', 'Combine fungicide use with cultural controls for best results'],
    prevention: ['Plant disease-free nursery stock in well-drained soil with good air circulation', 'Space plants properly to keep the canopy dry', 'Irrigate in the morning (if using overhead irrigation) so leaves dry quickly', 'Remove old infected foliage and debris at the end of the season'],
    isHealthy: false,
  },

  generic: {
    diseaseName: 'Unidentified Leaf Abnormality',
    severity: 'Moderate',
    affectedPlants: ['Unspecified'],
    description: 'The model detected leaf characteristics that don\u2019t closely match a healthy leaf, but a specific disease category could not be confidently matched to our reference guide.',
    symptoms: ['Discoloration or spotting visible on the leaf surface', 'Texture or color differs from a typical healthy leaf'],
    treatment: ['Isolate the plant from healthy ones if possible', 'Consult a local agricultural extension office for a precise diagnosis', 'Remove and dispose of obviously affected leaves'],
    prevention: ['Inspect plants weekly for early signs of stress', 'Avoid overhead watering where possible', 'Maintain good airflow and spacing between plants'],
    isHealthy: false,
  },
};

const matchRules: [RegExp, keyof typeof knowledgeBase][] = [
  [/healthy/, 'healthy'],
  [/yellow leaf curl/, 'yellowLeafCurl'],
  [/mosaic/, 'mosaicVirus'],
  [/late blight/, 'lateBlight'],
  [/early blight/, 'earlyBlight'],
  [/halo blight/, 'haloBlight'],
  [/sheath blight/, 'sheathBlight'],
  [/leaf curl/, 'leafCurl'],
  [/bacterial wilt/, 'bacterialWilt'],
  [/bacterial/, 'bacterialSpot'],
  [/septoria/, 'septoria'],
  [/target spot/, 'targetSpot'],
  [/tar spot/, 'tarSpot'],
  [/leafroll/, 'leafrollDisease'],
  [/blast/, 'riceBlast'],
  [/leaf scorch/, 'leafScorch'],
  [/alternaria/, 'alternaria'],
  [/cercospora|gray leaf|leaf spot/, 'leafSpot'],
  [/powdery/, 'powderyMildew'],
  [/downy/, 'downyMildew'],
  [/rust/, 'rust'],
  [/scab/, 'scab'],
  [/black rot|rot/, 'blackRot'],
  [/spider mite|mite/, 'mites'],
  [/anthracnose/, 'anthracnose'],
  [/wilt/, 'wilt'],
];

function normalize(className: string): string {
  return className.toLowerCase().replace(/__+/g, ' ').replace(/_/g, ' ').trim();
}

function extractCrop(className: string): string | null {
  const cropRaw = className.split(/__+/)[0];
  if (!cropRaw) return null;
  return cropRaw
    .replace(/_/g, ' ')
    .replace(/\(.*?\)/g, '')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function prettifyDiseaseName(className: string): string {
  const parts = className.split(/__+/);
  const diseasePart = parts.length > 1 ? parts[parts.length - 1] : className;
  return diseasePart
    .replace(/_/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const diseases: DetectionResult[] = Object.entries(knowledgeBase)
  .filter(([key]) => key !== 'generic')
  .map(([, entry]) => ({
    ...entry,
    confidence: 0.9,
    affectedArea: entry.isHealthy ? 0 : 30,
  }));

function lookupKnowledge(className: string): KnowledgeEntry {
  const normalized = normalize(className);
  for (const [pattern, key] of matchRules) {
    if (pattern.test(normalized)) return knowledgeBase[key];
  }
  return knowledgeBase.generic;
}

function buildResult(rawDisease: string, confidence: number): DetectionResult {
  const knowledge = lookupKnowledge(rawDisease);
  const crop = extractCrop(rawDisease);
  const diseaseName = knowledge.isHealthy
    ? 'Healthy Leaf'
    : prettifyDiseaseName(rawDisease);

  return {
    diseaseName,
    confidence,
    severity: knowledge.severity,
    affectedArea: 0,
    affectedPlants: crop ? [crop] : knowledge.affectedPlants,
    description: knowledge.description,
    symptoms: knowledge.symptoms,
    treatment: knowledge.treatment,
    prevention: knowledge.prevention,
    isHealthy: knowledge.isHealthy,
  };
}

export async function analyzeLeaf(imageFile: File): Promise<DetectionResult> {
  // Upload se pehle image resize/compress karo — low-memory crash rokne ke liye
  const compressedBlob = await compressImage(imageFile, 800, 800, 0.8);

  const form = new FormData();
  form.append('file', compressedBlob, 'leaf.jpg');

  const res = await fetch(`${API_URL}/predict`, { method: 'POST', body: form });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Diagnosis failed (${res.status})`);
  }

  const data: PredictResponse = await res.json();
  return buildResult(data.disease, data.confidence);
}
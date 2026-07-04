// Full list of classes the current model was trained on.
// Keep this in sync whenever the model is retrained with new/merged classes.

export interface ModelClassInfo {
  name: string;
  category: 'Healthy' | 'Disease' | 'Decorative';
}

const rawClassNames: string[] = [
  'Aloe_Vera', 'Apple_leaf', 'Areca_Palm', 'Monstera_Deliciosa', 'Snake_Plant',
  'Tomato__Target_Spot', 'Tomato_two_spotted_spider_mites_leaf',
  'apple mosaic virus', 'apple rust', 'apple scab',
  'banana leaf', 'banana panama disease',
  'basil downy mildew', 'basil leaf',
  'bean halo blight', 'bean leaf', 'bean mosaic virus', 'bean rust',
  'bell pepper leaf', 'bell pepper leaf spot',
  'blueberry leaf', 'blueberry rust',
  'broccoli downy mildew', 'broccoli leaf',
  'cabbage alternaria leaf spot', 'cabbage leaf',
  'carrot cavity spot',
  'cauliflower alternaria leaf spot', 'cauliflower leaf',
  'celery anthracnose', 'celery early blight', 'celery leaf',
  'cherry leaf', 'cherry leaf spot', 'cherry powdery mildew',
  'citrus canker', 'citrus greening disease',
  'coffee leaf', 'coffee leaf rust',
  'corn gray leaf spot', 'corn leaf', 'corn northern leaf blight', 'corn rust', 'corn smut',
  'cucumber angular leaf spot', 'cucumber bacterial wilt', 'cucumber leaf', 'cucumber powdery mildew',
  'eggplant cercospora leaf spot', 'eggplant leaf',
  'garlic leaf', 'garlic leaf blight', 'garlic rust',
  'ginger leaf', 'ginger leaf spot', 'ginger sheath blight',
  'grape black rot', 'grape downy mildew', 'grape leaf', 'grape leaf spot', 'grapevine leafroll disease',
  'lettuce downy mildew', 'lettuce leaf', 'lettuce mosaic virus',
  'maple leaf', 'maple tar spot',
  'peach leaf', 'peach leaf curl',
  'plum leaf', 'plum pocket disease',
  'potato early blight', 'potato late blight', 'potato leaf',
  'raspberry leaf',
  'rice blast', 'rice leaf', 'rice sheath blight',
  'soybean leaf',
  'squash leaf', 'squash powdery mildew',
  'strawberry anthracnose', 'strawberry leaf', 'strawberry leaf scorch',
  'tobacco leaf', 'tobacco mosaic virus',
  'tomato bacterial leaf spot', 'tomato early blight', 'tomato late blight',
  'tomato leaf', 'tomato leaf mold', 'tomato mosaic virus',
  'tomato septoria leaf spot', 'tomato yellow leaf curl virus',
  'zucchini yellow mosaic virus',
];

const decorativeNames = new Set(['Aloe_Vera', 'Areca_Palm', 'Monstera_Deliciosa', 'Snake_Plant']);

function prettify(name: string): string {
  return name
    .replace(/_/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function categorize(name: string): ModelClassInfo['category'] {
  if (decorativeNames.has(name)) return 'Decorative';
  const normalized = name.toLowerCase().replace(/_/g, ' ');
  // Same "ends with leaf, no disease keyword" rule used in detection.ts
  const diseaseKeywords = [
    'blight', 'rot', 'mosaic', 'virus', 'curl', 'mildew', 'rust', 'scab',
    'spot', 'mite', 'anthracnose', 'wilt', 'blast', 'scorch', 'disease',
    'canker', 'greening', 'smut', 'target',
  ];
  const isDisease = diseaseKeywords.some((k) => normalized.includes(k));
  return isDisease ? 'Disease' : 'Healthy';
}

export const modelClasses: ModelClassInfo[] = rawClassNames
  .map((name) => ({ name: prettify(name), category: categorize(name) }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const TOTAL_MODEL_CLASSES = modelClasses.length;
import type { TaskCategory, TrustLevel } from './types'

export const BOROUGHS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'] as const

export const NEIGHBORHOODS = {
  Manhattan: ['Harlem', 'Upper West Side', 'Upper East Side', 'Midtown', 'Chelsea', 'Greenwich Village', 'Lower East Side', 'Financial District'],
  Queens: ['Astoria', 'Sunnyside', 'Woodside', 'Jackson Heights', 'Elmhurst', 'Corona', 'Flushing', 'Jamaica', 'Long Island City', 'Rego Park', 'Forest Hills', 'Ridgewood'],
  Brooklyn: ['Williamsburg', 'Bushwick', 'Crown Heights', 'Park Slope', 'Flatbush', 'Bay Ridge'],
  Bronx: ['South Bronx', 'Fordham', 'Riverdale', 'Morris Park'],
  'Staten Island': ['St. George', 'Stapleton', 'New Dorp'],
}

export const TASK_CATEGORIES: Record<TaskCategory, { label: string; icon: string; trustRequired: TrustLevel; description: string }> = {
  simple_help: { label: 'Simple Help', icon: '🤝', trustRequired: 'new', description: 'Quick, no-skill tasks like carrying boxes or waiting in line' },
  errands: { label: 'Errands', icon: '🛍️', trustRequired: 'new', description: 'Shopping, picking up packages, bank runs' },
  delivery: { label: 'Delivery', icon: '📦', trustRequired: 'new', description: 'Drop-off or pick-up around the neighborhood' },
  moving: { label: 'Moving Help', icon: '🏠', trustRequired: 'established', description: 'Help moving furniture or boxes' },
  cleaning: { label: 'Cleaning', icon: '🧹', trustRequired: 'established', description: 'House or space cleaning help' },
  cooking: { label: 'Cooking', icon: '🍳', trustRequired: 'established', description: 'Meal prep or cooking assistance' },
  pet_care: { label: 'Pet Care', icon: '🐾', trustRequired: 'established', description: 'Dog walking, pet sitting, feeding' },
  tech_help: { label: 'Tech Help', icon: '💻', trustRequired: 'established', description: 'Phone setup, computer issues, Wi-Fi troubleshooting' },
  repairs: { label: 'Repairs', icon: '🔧', trustRequired: 'trusted', description: 'Fixing appliances, furniture, or home items' },
  tutoring: { label: 'Tutoring', icon: '📚', trustRequired: 'trusted', description: 'Academic help, language learning, skill teaching' },
  other: { label: 'Other', icon: '✨', trustRequired: 'new', description: 'Anything else your community needs' },
  skilled: { label: 'Skilled Work', icon: '⚡', trustRequired: 'trusted', description: 'Professional-level skills and expertise' },
}

export const TRUST_LEVELS: Record<TrustLevel, { label: string; color: string; description: string; requirements: string[] }> = {
  new: {
    label: 'New',
    color: 'gray',
    description: 'Just joined',
    requirements: ['Email verified'],
  },
  established: {
    label: 'Established',
    color: 'blue',
    description: 'Proven community member',
    requirements: ['3+ completed tasks', 'Rating 4.0+'],
  },
  trusted: {
    label: 'Trusted',
    color: 'purple',
    description: 'Highly reliable helper',
    requirements: ['10+ completed tasks', 'Rating 4.5+', 'No reports'],
  },
  verified: {
    label: 'Verified',
    color: 'green',
    description: 'ID-verified member',
    requirements: ['Government ID verified', 'Background check passed'],
  },
}

export const CREDITS_CONFIG = {
  earnPerHelpTask: 10,
  bonusOnboarding: 20,
  simpleTaskCost: 5,
  moderateTaskCost: 15,
  skilledTaskCost: 30,
}

export const MAP_CONFIG = {
  defaultCenter: { lat: 40.7831, lng: -73.9712 }, // Manhattan
  defaultZoom: 13,
  taskRadius: 2, // km
}

export const SKILLS = [
  // Physical & errand skills
  { id: 'carrying',       label: 'Carrying & lifting',   category: 'simple_help' },
  { id: 'errands',        label: 'Running errands',       category: 'errands' },
  { id: 'delivery',       label: 'Local delivery',        category: 'delivery' },
  { id: 'driving',        label: 'Driving',               category: 'errands' },
  // Home
  { id: 'cleaning',       label: 'Cleaning',              category: 'cleaning' },
  { id: 'moving',         label: 'Moving help',           category: 'moving' },
  { id: 'repairs',        label: 'Home repairs',          category: 'repairs' },
  { id: 'painting',       label: 'Painting',              category: 'repairs' },
  { id: 'furniture',      label: 'Furniture assembly',    category: 'repairs' },
  // Food
  { id: 'cooking',        label: 'Cooking',               category: 'cooking' },
  { id: 'meal_prep',      label: 'Meal prep',             category: 'cooking' },
  // Tech
  { id: 'tech_support',   label: 'Tech support',          category: 'tech_help' },
  { id: 'phone_setup',    label: 'Phone & tablet setup',  category: 'tech_help' },
  { id: 'wifi',           label: 'Wi-Fi troubleshooting', category: 'tech_help' },
  // Care
  { id: 'pet_care',       label: 'Pet care',              category: 'pet_care' },
  { id: 'dog_walking',    label: 'Dog walking',           category: 'pet_care' },
  { id: 'childcare',      label: 'Childcare',             category: 'simple_help' },
  { id: 'elder_care',     label: 'Elder care',            category: 'simple_help' },
  // Education
  { id: 'tutoring',       label: 'Tutoring',              category: 'tutoring' },
  { id: 'language',       label: 'Language teaching',     category: 'tutoring' },
  // Skilled
  { id: 'photography',    label: 'Photography',           category: 'skilled' },
  { id: 'graphic_design', label: 'Graphic design',        category: 'skilled' },
  { id: 'sewing',         label: 'Sewing & alterations',  category: 'skilled' },
] as const

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ko', label: 'Korean' },
  { code: 'bn', label: 'Bengali' },
  { code: 'ar', label: 'Arabic' },
  { code: 'fr', label: 'French' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ur', label: 'Urdu' },
]

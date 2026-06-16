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

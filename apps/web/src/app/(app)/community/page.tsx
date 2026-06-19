'use client'

import { useState } from 'react'
import Link from 'next/link'

type Tab = 'centers' | 'resources'
type CulturalGroup = 'all' | 'filipino' | 'east_asian' | 'latino' | 'south_asian' | 'caribbean' | 'african' | 'lgbtq' | 'general'

const PARTICIPATION_STYLES = [
  {
    id: 'introvert',
    icon: '🌿',
    label: 'Introvert-friendly',
    tagline: 'Help on your own terms — minimal contact, maximum impact.',
    description:
      'Prefer tasks where you can contribute without a lot of face-to-face interaction? These are perfect for you. Drop things off, help remotely, or work at your own pace.',
    color: 'bg-blue-50 border-blue-100',
    accent: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    categories: [
      { icon: '🛒', label: 'Errands & drop-offs', filter: 'errands' },
      { icon: '💻', label: 'Online tech help', filter: 'tech_help' },
      { icon: '✍️', label: 'Writing & editing', filter: 'other' },
      { icon: '🐾', label: 'Pet drop-in visits', filter: 'pet_care' },
    ],
    tips: [
      'Use the description field to request contactless drop-off',
      'Set "Remote / online" in your task address for virtual help',
      'Post tasks early — flexible timing gets the most responses',
    ],
  },
  {
    id: 'ambivert',
    icon: '🤝',
    label: 'Ambivert-friendly',
    tagline: 'Short, friendly interactions — in and out.',
    description:
      'You\'re comfortable meeting people but don\'t need long social engagements. Brief, purposeful tasks are your sweet spot — helpful without being overwhelming.',
    color: 'bg-amber-50 border-amber-100',
    accent: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
    categories: [
      { icon: '🛍️', label: 'Grocery shopping', filter: 'errands' },
      { icon: '🔧', label: 'Minor repairs', filter: 'repairs' },
      { icon: '📦', label: 'Assembly & setup', filter: 'repairs' },
      { icon: '🐕', label: 'Dog walking', filter: 'pet_care' },
    ],
    tips: [
      'Cash or credits tasks tend to attract faster helpers',
      'A photo in your task description sets clear expectations',
      'Rate your helper — it helps the whole community',
    ],
  },
  {
    id: 'extrovert',
    icon: '🎉',
    label: 'Extrovert-friendly',
    tagline: 'Dive in, connect, and make it a great experience.',
    description:
      'You thrive with people. These tasks involve real collaboration — showing up, coordinating, and turning a chore into a genuine community moment.',
    color: 'bg-rose-50 border-rose-100',
    accent: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
    categories: [
      { icon: '📦', label: 'Moving & heavy lifting', filter: 'moving' },
      { icon: '📚', label: 'In-person tutoring', filter: 'tutoring' },
      { icon: '🎈', label: 'Event help', filter: 'simple_help' },
      { icon: '🤲', label: 'Community projects', filter: 'simple_help' },
    ],
    tips: [
      'Free tasks are a great way to meet neighbors and build trust',
      'Check the Map view to find tasks happening near you right now',
      'Offer to help on tasks — helpers get 10 credits per free task',
    ],
  },
]

const FILTERS: { value: CulturalGroup; label: string; icon: string }[] = [
  { value: 'all',        label: 'All',            icon: '🌍' },
  { value: 'filipino',   label: 'Filipino',       icon: '🇵🇭' },
  { value: 'east_asian', label: 'East / SE Asian', icon: '🏮' },
  { value: 'latino',     label: 'Latino / Hispanic', icon: '🌺' },
  { value: 'south_asian',label: 'South Asian',    icon: '🕌' },
  { value: 'caribbean',  label: 'Caribbean',      icon: '🌊' },
  { value: 'african',    label: 'African / Black', icon: '✊' },
  { value: 'lgbtq',      label: 'LGBTQ+',         icon: '🏳️‍🌈' },
  { value: 'general',    label: 'General',         icon: '🏘️' },
]

const BADGE_COLORS: Record<CulturalGroup, string> = {
  all:         'bg-gray-100 text-gray-700',
  filipino:    'bg-blue-100 text-blue-700',
  east_asian:  'bg-red-100 text-red-700',
  latino:      'bg-green-100 text-green-700',
  south_asian: 'bg-purple-100 text-purple-700',
  caribbean:   'bg-teal-100 text-teal-700',
  african:     'bg-amber-100 text-amber-800',
  lgbtq:       'bg-rose-100 text-rose-700',
  general:     'bg-gray-100 text-gray-700',
}

const CENTERS = [
  {
    id: 1,
    name: 'Philippine Center of New York',
    cultural: 'filipino' as CulturalGroup,
    type: 'Cultural & Civic Center',
    neighborhood: 'Midtown, Manhattan',
    address: '556 Fifth Ave, New York, NY 10036',
    services: ['Cultural events', 'Legal aid referrals', 'Job placement', 'Community programs'],
    description: 'The official hub for the Filipino community in NYC, offering civic, cultural, and social services.',
    website: 'https://philippinecenterny.com/',
  },
  {
    id: 2,
    name: 'Filipino American Human Services, Inc. ',
    cultural: 'filipino' as CulturalGroup,
    type: 'Social Services & Cultural Center',
    neighborhood: 'Jamaica, Queens',
    address: '185-14 Hillside Ave., Jamaica, NY 11432',
    services: ['Immigration assistance', 'Community organizing', 'Youth programs', 'Social services'],
    description: 'Empowering Filipino and Southeast Asian immigrants through social services and community organizing.',
    website: 'https://aanhpihealth.org/directory/filipino-american-human-services-inc/',
  },
  {
    id: 3,
    name: 'Chinese-American Planning Council',
    cultural: 'east_asian' as CulturalGroup,
    type: 'Social Services',
    neighborhood: 'Chinatown / Lower East Side, Manhattan',
    address: '150 Elizabeth St, New York, NY 10012',
    services: ['Youth development', 'Elder care', 'Job training', 'Immigration services'],
    description: 'The largest social services agency serving Asian Americans and immigrant communities in the US.',
    website: 'cpc-nyc.org',
  },
  {
    id: 4,
    name: 'Korean American Family Service Center',
    cultural: 'east_asian' as CulturalGroup,
    type: 'Cultural & Social',
    neighborhood: 'Flushing, Queens',
    address: 'Bayside, NY 11361',
    services: ['Counseling', 'Immigration help', 'Senior programs', 'Language support'],
    description: 'Serving the Korean and pan-Asian community in Queens with social and cultural programs.',
    website: 'https://www.kafsc.org/',
  },
  {
    id: 5,
    name: 'Hispanic Federation',
    cultural: 'latino' as CulturalGroup,
    type: 'Advocacy & Services',
    neighborhood: 'Lower Manhattan',
    address: '55 Exchange Pl, New York, NY 10005',
    services: ['Education', 'Health services', 'Immigration advocacy', 'Economic empowerment'],
    description: 'A leading Latino nonprofit supporting families across the Northeast with education, health, and advocacy.',
    website: 'hispanicfederation.org',
  },
  {
    "id": 6,
    "name": "Alianza Dominicana Cultural Center",
    "cultural": "latino",
    "type": "Civic & Cultural",
    "neighborhood": "Washington Heights, Manhattan",
    "address": "530 W 166th St, New York, NY 10032",
    "services": [
      "Arts & Music workshops",
      "Youth employment programs",
      "Computer literacy",
      "Community meeting space"
    ],
    "description": "A multi-disciplinary arts center showcasing Dominican and Latin American culture while providing free youth programs and intergenerational learning.",
    "website": "https://cccsny.org/services/alianza-dominicana-cultural-center"
  },
  {
    id: 7,
    name: 'South Asian Council for Social Services (SACSS)',
    cultural: 'south_asian' as CulturalGroup,
    type: 'Social Services',
    neighborhood: 'Ozone Park, Queens',
    address: '98-86 97th Ave, Ozone Park, NY 11416',
    services: ['Domestic violence support', 'Immigration aid', 'Food pantry', 'Legal help'],
    description: 'Serving South Asian immigrants with essential social services and culturally sensitive support.',
    website: 'sacssny.org',
  },
  {
    id: 8,
    name: 'Caribbean Cultural Center African Diaspora Institute',
    cultural: 'caribbean' as CulturalGroup,
    type: 'Cultural Center',
    neighborhood: 'East Harlem, Manhattan',
    address: '120 E 125th St, New York, NY 10035',
    services: ['Cultural programming', 'Arts education', 'Heritage preservation', 'Community events'],
    description: 'Celebrating and preserving the cultural traditions of African and Caribbean heritage throughout the diaspora.',
    website: 'cccadi.org',
  },
  {
    id: 9,
    name: 'Weeksville Heritage Center',
    cultural: 'african' as CulturalGroup,
    type: 'Cultural & Historical',
    neighborhood: 'Crown Heights, Brooklyn',
    address: '158 Buffalo Ave, Brooklyn, NY 11213',
    services: ['History programs', 'Youth education', 'Cultural events', 'Community space'],
    description: 'Preserving the history of Weeksville, one of the earliest free African American communities in the US.',
    website: 'weeksvillesociety.org',
  },
  {
    id: 10,
    name: 'NYC LGBT Community Center',
    cultural: 'lgbtq' as CulturalGroup,
    type: 'Community Center',
    neighborhood: 'West Village, Manhattan',
    address: '208 W 13th St, New York, NY 10011',
    services: ['Mental health services', 'Youth programs', 'HIV/AIDS support', 'Community events'],
    description: 'The anchor of LGBTQ+ life in NYC, offering health, wellness, social, and community programs.',
    website: 'gaycenter.org',
  },
  {
    id: 11,
    name: 'Henry Street Settlement',
    cultural: 'general' as CulturalGroup,
    type: 'Community Center',
    neighborhood: 'Lower East Side, Manhattan',
    address: '265 Henry St, New York, NY 10002',
    services: ['Arts programs', 'Early childhood', 'Senior care', 'Job training'],
    description: 'A pioneering settlement house serving the Lower East Side community for over 130 years.',
    website: 'henrystreet.org',
  },
  {
    id: 12,
    name: 'Bronx Community Health Network',
    cultural: 'general' as CulturalGroup,
    type: 'Health & Social Services',
    neighborhood: 'South Bronx, Bronx',
    address: 'South Bronx, NY 10454',
    services: ['Health screenings', 'Food assistance', 'Youth programs', 'Community wellness'],
    description: 'Providing integrated health and social services to underserved communities across the Bronx.',
    website: 'https://www.bchnhealth.org/',
  },
]

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>('centers')
  const [active, setActive] = useState<CulturalGroup>('all')

  const filtered = active === 'all' ? CENTERS : CENTERS.filter(c => c.cultural === active)
  const activeMeta = FILTERS.find(f => f.value === active)!

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Community</h1>
        <p className="text-gray-500 text-sm">
          Find cultural organizations near NYC and discover the best ways to get involved.
        </p>
      </div>

      {/* Main tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('centers')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'centers' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🏘️ Community Centers
        </button>
        <button
          onClick={() => setTab('resources')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'resources' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          💡 Resources
        </button>
      </div>

      {/* ── Resources tab ── */}
      {tab === 'resources' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Find your way to help</h2>
            <p className="text-sm text-gray-500">
              Everyone contributes differently. Whether you prefer quiet drop-offs or lively group tasks,
              there's a place for you in Clutch.
            </p>
          </div>

          {PARTICIPATION_STYLES.map(style => (
            <div key={style.id} className={`rounded-2xl border p-6 ${style.color}`}>
              <div className="flex items-start gap-4">
                <span className="text-4xl">{style.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={`font-bold text-gray-900 text-base`}>{style.label}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                      {style.tagline}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{style.description}</p>

                  {/* Suggested task types */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Good task types for you</p>
                    <div className="flex flex-wrap gap-2">
                      {style.categories.map(cat => (
                        <Link
                          key={cat.label}
                          href={`/tasks?filter=${cat.filter}`}
                          className="flex items-center gap-1.5 bg-white/70 hover:bg-white border border-white/80 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                        >
                          <span>{cat.icon}</span>
                          {cat.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tips</p>
                    <ul className="space-y-1">
                      {style.tips.map(tip => (
                        <li key={tip} className="flex items-start gap-2 text-xs text-gray-600">
                          <span className={`mt-0.5 font-bold ${style.accent}`}>→</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Bottom CTA */}
          <div className="bg-orange-50 rounded-2xl p-5 text-center mt-2">
            <p className="font-semibold text-gray-900 mb-1">Not sure where to start?</p>
            <p className="text-sm text-gray-500 mb-4">Browse all open tasks and offer to help — no commitment needed.</p>
            <Link href="/tasks" className="btn-primary text-sm py-2 px-5 inline-flex">
              Browse tasks →
            </Link>
          </div>
        </div>
      )}

      {/* ── Community Centers tab ── */}
      {tab === 'centers' && (<>
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              active === f.value
                ? 'bg-clutch-600 text-white border-clutch-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-clutch-300'
            }`}
          >
            <span>{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400 mb-4">
        {filtered.length} center{filtered.length !== 1 ? 's' : ''}{active !== 'all' ? ` · ${activeMeta.label}` : ' · All communities'}
      </p>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(center => {
          const badge = BADGE_COLORS[center.cultural]
          const filterMeta = FILTERS.find(f => f.value === center.cultural)!
          return (
            <div key={center.id} className="card p-5 flex flex-col gap-3 hover:border-clutch-200 transition-colors">
              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge}`}>
                  {filterMeta.icon} {filterMeta.label}
                </span>
                <span className="text-[11px] text-gray-400 font-medium">{center.type}</span>
              </div>

              {/* Name & neighborhood */}
              <div>
                <h3 className="font-semibold text-gray-900 text-sm leading-snug">{center.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">📍 {center.neighborhood}</p>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{center.description}</p>

              {/* Services */}
              <div className="flex flex-wrap gap-1">
                {center.services.map(s => (
                  <span key={s} className="text-[10px] bg-orange-50 text-clutch-700 px-2 py-0.5 rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">{center.address}</span>
                {center.website && (
                  <a
                    href={`https://${center.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-clutch-600 hover:text-clutch-700 shrink-0 ml-2"
                  >
                    Visit →
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className="mt-8 bg-orange-50 rounded-2xl p-5 text-center">
        <p className="text-sm font-semibold text-clutch-800 mb-1">Know a center we're missing?</p>
        <p className="text-xs text-gray-500 mb-3">Help us grow this directory for all NYC communities.</p>
        <a
          href="mailto:hello@clutch.nyc"
          className="btn-primary text-xs py-2 px-4 inline-flex"
        >
          Suggest a community center
        </a>
      </div>
      </>)}
    </div>
  )
}

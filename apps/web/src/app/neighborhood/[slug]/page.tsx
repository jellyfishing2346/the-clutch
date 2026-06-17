import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NEIGHBORHOODS, TASK_CATEGORIES } from 'shared'

type Borough = keyof typeof NEIGHBORHOODS

const BOROUGH_DESCRIPTIONS: Record<Borough, string> = {
  Manhattan: 'The heart of NYC, from Harlem to the Financial District.',
  Queens:    'The most ethnically diverse urban area in the world.',
  Brooklyn:  'Creative, vibrant, and deeply neighborly.',
  Bronx:     'Rich in culture, community, and history.',
  'Staten Island': 'A close-knit borough with a strong neighborhood spirit.',
}

const NEIGHBORHOOD_HIGHLIGHTS: Record<string, string> = {
  // Queens
  Astoria:           'Known for Greek culture, great food, and a thriving arts scene.',
  'Jackson Heights': 'One of NYC\'s most linguistically diverse neighborhoods.',
  Flushing:          'A hub for Asian cuisine and culture in the heart of Queens.',
  Elmhurst:          'A vibrant, multicultural community with authentic global food.',
  Corona:            'Home to Flushing Meadows and a tight-knit Latino community.',
  'Long Island City': 'A rapidly growing neighborhood with waterfront views of Manhattan.',
  Woodside:          'A welcoming neighborhood with strong Irish and Filipino roots.',
  Sunnyside:         'A peaceful residential neighborhood with a lively main street.',
  Jamaica:           'A transit hub and commercial center in southeastern Queens.',
  'Rego Park':       'A largely residential neighborhood with diverse dining options.',
  'Forest Hills':    'Quiet tree-lined streets and a beloved Tudor-style village.',
  Ridgewood:         'A historic neighborhood straddling Queens and Brooklyn.',
  // Manhattan
  Harlem:            'A cultural capital known for music, art, and community pride.',
  'Upper West Side': 'Residential elegance alongside Central Park and Lincoln Center.',
  'Upper East Side': 'Museum Mile, historic townhouses, and quiet tree-lined streets.',
  Midtown:           'The commercial and cultural engine of New York City.',
  Chelsea:           'Art galleries, the High Line, and a vibrant LGBTQ+ community.',
  'Greenwich Village': 'Bohemian history, jazz clubs, and charming brownstones.',
  'Lower East Side': 'Historic immigrant roots with a modern creative energy.',
  'Financial District': 'Where history and finance meet at the southern tip of Manhattan.',
  // Brooklyn
  Williamsburg:      'Trendy and artsy with a world-class food and music scene.',
  Bushwick:          'NYC\'s street art capital with a growing creative community.',
  'Crown Heights':   'A culturally rich neighborhood with Caribbean and Jewish heritage.',
  'Park Slope':      'Family-friendly brownstones beside Prospect Park.',
  Flatbush:          'A diverse community with strong Caribbean cultural ties.',
  'Bay Ridge':       'A waterfront neighborhood with Scandinavian and Arab heritage.',
  // Bronx
  'South Bronx':     'The birthplace of hip-hop, now a community on the rise.',
  Fordham:           'Home to Fordham University and a busy commercial corridor.',
  Riverdale:         'Wooded, quiet, and perched above the Hudson River.',
  'Morris Park':     'A tight-knit Italian-American community in the East Bronx.',
  // Staten Island
  'St. George':      'The ferry terminus and cultural hub of Staten Island.',
  Stapleton:         'A revitalized waterfront neighborhood with a growing arts scene.',
  'New Dorp':        'A charming, family-oriented neighborhood on the South Shore.',
}

function slugToNeighborhood(slug: string): { neighborhood: string; borough: Borough } | null {
  const decoded = decodeURIComponent(slug).replace(/-/g, ' ')
  for (const [borough, hoods] of Object.entries(NEIGHBORHOODS) as [Borough, string[]][]) {
    const match = hoods.find(h => h.toLowerCase() === decoded.toLowerCase())
    if (match) return { neighborhood: match, borough }
  }
  return null
}

export async function generateStaticParams() {
  return Object.values(NEIGHBORHOODS)
    .flat()
    .map(hood => ({ slug: hood.toLowerCase().replace(/\s+/g, '-') }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const result = slugToNeighborhood(slug)
  if (!result) return { title: 'Neighborhood | Clutch' }
  const { neighborhood, borough } = result
  return {
    title: `Tasks & Help in ${neighborhood}, ${borough} | Clutch`,
    description: `Find neighbors offering help in ${neighborhood}, ${borough}. Post tasks, earn credits, and build community on Clutch — NYC's hyperlocal task marketplace.`,
    keywords: [`${neighborhood} tasks`, `${neighborhood} help`, `${borough} community`, 'neighborhood tasks NYC', 'Clutch'],
    openGraph: {
      title: `${neighborhood} Community | Clutch`,
      description: `Neighbors helping neighbors in ${neighborhood}, ${borough}.`,
      type: 'website',
    },
  }
}

const FEATURED_CATEGORIES = ['simple_help', 'errands', 'delivery', 'tech_help', 'pet_care', 'tutoring'] as const

export default async function NeighborhoodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = slugToNeighborhood(slug)
  if (!result) notFound()

  const { neighborhood, borough } = result
  const highlight = NEIGHBORHOOD_HIGHLIGHTS[neighborhood]
  const boroughDesc = BOROUGH_DESCRIPTIONS[borough]

  return (
    <div className="min-h-screen" style={{ background: '#fdfaf5' }}>
      {/* Nav */}
      <header className="border-b border-purple-100 bg-[#fdfaf5]/95 backdrop-blur px-6 py-4 flex items-center justify-between">
        <Link href="/" className="logo-frame text-xl">Clutch</Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">Sign in</Link>
          <Link href="/signup" className="btn-primary text-sm py-2 px-5">Join free</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-clutch-50 text-clutch-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          📍 {borough}, New York City
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          {neighborhood} Community Tasks
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          {highlight ?? boroughDesc} Find neighbors ready to help — or lend a hand and earn credits.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className="btn-primary py-3 px-8 text-base">
            Join {neighborhood} →
          </Link>
          <Link href="/tasks" className="border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors px-8 py-3 rounded-xl text-base font-medium">
            Browse open tasks
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: 'Free', label: 'Always free to join' },
            { value: '20 CR', label: 'Welcome credits' },
            { value: '4-tier', label: 'Trust system' },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <div className="text-2xl font-bold text-clutch-600">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Task categories */}
      <section className="bg-orange-50/60 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Popular tasks in {neighborhood}
          </h2>
          <p className="text-gray-500 mb-8">Neighbors help with all kinds of everyday needs.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURED_CATEGORIES.map(key => {
              const cat = TASK_CATEGORIES[key]
              return (
                <Link
                  key={key}
                  href={`/tasks?category=${key}&neighborhood=${encodeURIComponent(neighborhood)}`}
                  className="card p-5 hover:shadow-md transition-shadow group"
                >
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <div className="font-semibold text-gray-900 group-hover:text-clutch-700 transition-colors">
                    {cat.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{cat.description}</div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          How Clutch works in {neighborhood}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: '1', title: 'Post a task', desc: `Describe what you need help with in ${neighborhood} and set a budget or credit offer.` },
            { n: '2', title: 'Get matched', desc: 'Neighbors with the right skills and trust level apply. Review profiles and pick your helper.' },
            { n: '3', title: 'Help out & earn', desc: 'Complete tasks for cash or credits. Credits stack up and can pay for your next task.' },
          ].map(step => (
            <div key={step.n} className="text-center">
              <div className="w-12 h-12 gradient-brand text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                {step.n}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nearby neighborhoods */}
      <section className="bg-purple-50/40 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Other {borough} neighborhoods on Clutch</h2>
          <div className="flex flex-wrap gap-2">
            {NEIGHBORHOODS[borough]
              .filter(h => h !== neighborhood)
              .map(hood => (
                <Link
                  key={hood}
                  href={`/neighborhood/${hood.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-clutch-300 hover:text-clutch-700 transition-colors"
                >
                  {hood}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Ready to help or get help in {neighborhood}?
        </h2>
        <p className="text-gray-500 mb-8">Join for free and get 20 credits to post your first task.</p>
        <Link href="/signup" className="btn-primary py-3 px-10 text-base">
          Join Clutch free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center text-sm text-gray-400">
        <Link href="/" className="logo-frame mr-3">Clutch</Link>
        Neighbors helping neighbors across NYC ·{' '}
        <Link href="/about" className="hover:text-gray-600">About</Link>
      </footer>
    </div>
  )
}

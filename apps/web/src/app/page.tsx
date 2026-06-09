import Link from 'next/link'
import { TASK_CATEGORIES } from 'shared'

const FEATURED_CATEGORIES = ['simple_help', 'errands', 'tech_help', 'pet_care', 'moving', 'tutoring'] as const

const STATS = [
  { value: '500+', label: 'Community members' },
  { value: '1,200+', label: 'Tasks completed' },
  { value: '6', label: 'NYC neighborhoods' },
  { value: '4.8★', label: 'Average rating' },
]

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Post or browse tasks',
    desc: 'Share what you need or find nearby tasks you can help with — sorted by distance from you.',
  },
  {
    step: '2',
    title: 'Connect with neighbors',
    desc: 'Review profiles, ratings, and task history. Trust levels help you find the right match.',
  },
  {
    step: '3',
    title: 'Help out & earn credits',
    desc: 'Complete tasks for cash, credits, or just to build community. Credits spend like cash on future tasks.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-poppins">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gradient">Clutch</span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#how-it-works" className="hover:text-clutch-600 transition-colors">How it works</a>
            <a href="#categories" className="hover:text-clutch-600 transition-colors">Categories</a>
            <a href="#community" className="hover:text-clutch-600 transition-colors">Community</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm py-2">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-20 px-4 bg-gradient-to-br from-clutch-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-clutch-100 text-clutch-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span>🗽</span> Building community across NYC neighborhoods
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your neighbors are{' '}
            <span className="text-gradient">ready to help.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Clutch connects you with people nearby for everyday tasks — carrying groceries,
            tech support, dog walks, and more. Real neighbors, real help, real trust.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-base py-4 px-8 rounded-2xl">
              Find help near me →
            </Link>
            <Link href="/tasks" className="btn-secondary text-base py-4 px-8 rounded-2xl">
              Browse open tasks
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-14 flex flex-wrap justify-center gap-8 md:gap-12">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-gradient">{s.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">How Clutch works</h2>
          <p className="text-center text-gray-500 mb-14 text-lg">Three simple steps to get or give help.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(step => (
              <div key={step.step} className="text-center">
                <div className="w-14 h-14 gradient-brand text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">What can Clutch help with?</h2>
          <p className="text-center text-gray-500 mb-14 text-lg">From simple favors to skilled work — all in your neighborhood.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURED_CATEGORIES.map(cat => {
              const info = TASK_CATEGORIES[cat]
              return (
                <div key={cat} className="card p-5 text-center hover:border-clutch-200 transition-colors">
                  <div className="text-3xl mb-3">{info.icon}</div>
                  <div className="font-semibold text-gray-900">{info.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{info.description}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section id="community" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Trust that grows with your community
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Not every task needs the same level of trust. Grabbing groceries is different
                from fixing an appliance. Clutch matches trust requirements to the task —
                so you always feel safe.
              </p>
              <div className="space-y-3">
                {[
                  { badge: '○ New', desc: 'Simple tasks — anyone can help' },
                  { badge: '◆ Established', desc: '3+ tasks done, 4.0+ rating' },
                  { badge: '★ Trusted', desc: '10+ tasks, 4.5+ rating, no reports' },
                  { badge: '✓ Verified', desc: 'Government ID verified' },
                ].map(t => (
                  <div key={t.badge} className="flex items-center gap-3 text-sm">
                    <span className="font-mono font-semibold text-clutch-600 w-28 shrink-0">{t.badge}</span>
                    <span className="text-gray-500">{t.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-clutch-50 to-purple-50 rounded-3xl p-8">
              <div className="space-y-4">
                {[
                  { name: 'Maria S.', task: 'Helped carry groceries', rating: 5, badge: '★ Trusted' },
                  { name: 'James P.', task: 'Fixed WiFi router', rating: 5, badge: '◆ Established' },
                  { name: 'Fatima H.', task: 'Translated documents', rating: 5, badge: '✓ Verified' },
                ].map(review => (
                  <div key={review.name} className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm text-gray-900">{review.name}</span>
                      <span className="text-xs text-purple-600 font-medium">{review.badge}</span>
                    </div>
                    <div className="text-xs text-gray-500">{review.task}</div>
                    <div className="text-amber-400 text-xs mt-1">{'★'.repeat(review.rating)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credits section */}
      <section className="py-20 px-4 bg-gradient-to-br from-clutch-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">◈</div>
          <h2 className="text-3xl font-bold mb-4">Earn credits. Pay it forward.</h2>
          <p className="text-clutch-100 text-lg mb-8 leading-relaxed">
            Help someone for free and earn Clutch Credits. Spend them when you need help.
            It's a community economy built on neighbors caring for neighbors.
          </p>
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[
              { icon: '🤝', label: 'Help a neighbor', value: '+10 CR' },
              { icon: '🎁', label: 'Welcome bonus', value: '+20 CR' },
              { icon: '📮', label: 'Post a task', value: '-5 to -30 CR' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-sm text-clutch-200">{item.label}</div>
                <div className="text-lg font-bold mt-1">{item.value}</div>
              </div>
            ))}
          </div>
          <Link href="/signup" className="inline-block bg-white text-clutch-700 font-semibold px-8 py-4 rounded-2xl hover:bg-clutch-50 transition-colors">
            Get 20 free credits →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 bg-gray-900 text-gray-400 text-sm">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-white font-bold text-lg">Clutch</span>
            <span className="ml-2">— Neighbors helping neighbors across NYC.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/tasks" className="hover:text-white transition-colors">Browse Tasks</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

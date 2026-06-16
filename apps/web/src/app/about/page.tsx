import Link from 'next/link'

const FAQ = [
  {
    q: 'Is Clutch free to use?',
    a: 'Joining is always free. You can post tasks using Clutch Credits (earned by helping others) or pay helpers directly with cash. New members get 20 credits free just for signing up.',
  },
  {
    q: 'How does trust work?',
    a: 'Every Clutch member starts as New. As you complete tasks and collect reviews, your trust level grows — from Established to Trusted to Verified. Higher trust unlocks more task types and signals reliability to your neighbors.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'Your exact address is never shared publicly. It is only revealed to a helper once you have accepted their offer. You can review a helper\'s full task history and ratings before deciding.',
  },
  {
    q: 'What kinds of tasks can I post?',
    a: 'Anything a neighbor can realistically help with — carrying groceries, tech support, dog walking, tutoring, moving, errands, and more. Tasks that are illegal, unsafe, or require professional licensing are not allowed.',
  },
  {
    q: 'What if something goes wrong?',
    a: 'Clutch has a review and report system. If a helper is late, unprofessional, or a task goes poorly, you can leave a review and flag the issue. Repeated reports reduce a member\'s trust level automatically.',
  },
  {
    q: 'Do I have to pay in cash?',
    a: 'No — cash is just one option. You can use Clutch Credits, arrange a skill exchange, or post a free community task (helpers earn 10 credits for free tasks). The payment type is always set in advance, before anyone accepts.',
  },
]

export default function AboutPage() {
  return (
    <div className="font-poppins" style={{ backgroundColor: '#fdfaf5' }}>
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fdfaf5]/95 backdrop-blur border-b border-purple-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="logo-frame text-xl">Clutch</Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm py-2">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
            Built for the city that{' '}
            <span className="text-gradient">never stops helping.</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
            Clutch started with one idea: NYC is full of people who want to help each other, they just need a way to connect.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 bg-[#fdfaf5]">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our mission</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              New York is one of the most densely populated places on earth — and yet millions of people feel isolated,
              especially when they need a small hand. Moving a couch. Walking a dog during a long shift.
              Getting tech help when you don't know who to call.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Clutch makes it easy to ask and easy to help. We designed the trust system so that helping earns you
              something back — not just good feeling, but real credits you can spend when you need help next.
              That's a community economy.
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-3xl p-8 space-y-4">
            {[
              { icon: '🗽', label: 'All 5 NYC boroughs', sub: 'From the Bronx to Staten Island' },
              { icon: '◈', label: 'Community credits', sub: 'Help someone, earn something back' },
              { icon: '🛡️', label: '4-tier trust system', sub: 'Know exactly who you\'re working with' },
              { icon: '♥', label: 'Always free to join', sub: 'No subscriptions, no hidden fees' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-sm">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-orange-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">What we believe</h2>
          <p className="text-center text-gray-500 mb-12">The principles behind every decision we make.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🤝',
                title: 'Neighbors first',
                desc: 'Every feature starts with: does this make it easier to ask for help, or easier to give it? If not, we don\'t build it.',
              },
              {
                icon: '🔍',
                title: 'Trust is earned',
                desc: 'We don\'t verify everyone upfront — we let actions build reputation over time. That\'s how real communities work.',
              },
              {
                icon: '🌍',
                title: 'Every community matters',
                desc: 'NYC is one of the most diverse cities on earth. Clutch is built for everyone — every borough, every culture, every language.',
              },
            ].map(v => (
              <div key={v.title} className="card p-6">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-[#fdfaf5]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Frequently asked questions</h2>
          <p className="text-center text-gray-500 mb-10">Everything you need to know before you start.</p>
          <div className="space-y-4">
            {FAQ.map(item => (
              <details key={item.q} className="card p-5 group">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center gap-4">
                  {item.q}
                  <span className="text-clutch-500 text-lg shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-gray-500 leading-relaxed mt-3 border-t border-gray-50 pt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 gradient-brand text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to meet your neighbors?</h2>
          <p className="text-white/80 mb-7 text-sm">
            Join Clutch today and get 20 free credits to start with.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="bg-white text-clutch-700 font-semibold px-7 py-3.5 rounded-2xl hover:bg-orange-50 transition-colors text-sm">
              Get started free →
            </Link>
            <Link href="/tasks" className="border border-white/40 text-white font-semibold px-7 py-3.5 rounded-2xl hover:bg-white/10 transition-colors text-sm">
              Browse open tasks
            </Link>
          </div>
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
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/tasks" className="hover:text-white transition-colors">Browse Tasks</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

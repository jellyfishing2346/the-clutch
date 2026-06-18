import { Navbar } from '@/components/layout/Navbar'
import { ChatWidget } from '@/components/ai/ChatWidget'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-amber-50/40">
      <Navbar />
      <main className="md:pt-16 pb-20 md:pb-0">
        {children}
      </main>
      <ChatWidget />
    </div>
  )
}

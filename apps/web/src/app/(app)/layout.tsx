import { Navbar } from '@/components/layout/Navbar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="md:pt-16 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}

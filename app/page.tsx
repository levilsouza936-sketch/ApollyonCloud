import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Check, Gamepad2, Server, Shield, Cpu, HardDrive, Zap } from 'lucide-react'
import PricingSection from '@/components/PricingSection'
import { signInWithDiscord } from '@/app/actions'
import AnnouncementPopup from '@/components/AnnouncementPopup'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar assinatura ativa se o usuário estiver logado
  let hasActiveSubscription = false
  let currentPlan: { tier: 'Standard' | 'Elite'; cycle: 'weekly' | 'monthly' } | null = null

  if (user) {
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('status, expires_at, products(name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // Verificar apenas a assinatura MAIS RECENTE (igual ao Dashboard)
    if (subscriptions && subscriptions.length > 0) {
      const now = new Date()
      const latestSub = subscriptions[0]
      const isExpired = new Date(latestSub.expires_at) < now
      hasActiveSubscription = !isExpired

      // Determinar plano e ciclo atual
      if (!isExpired) {
        const productName = (latestSub.products as any)?.name || ''
        const tier = productName.toLowerCase().includes('elite') ? 'Elite' : 'Standard'

        // Calcular se é semanal ou mensal baseado no tempo restante
        const expiresAt = new Date(latestSub.expires_at)
        const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const cycle = daysRemaining < 15 ? 'weekly' : 'monthly'

        currentPlan = { tier, cycle }
      }
    }
  }

  // Buscar anúncios ativos
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, description, image_url, button_text, button_link, show_once_per_session')
    .eq('active', true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(1)

  // Buscar preços dos produtos
  const { data: products } = await supabase
    .from('products')
    .select('name, price, cycle')
    .eq('active', true)

  const prices = {
    Standard: { weekly: 0, monthly: 0 },
    Elite: { weekly: 0, monthly: 0 }
  }

  if (products) {
    products.forEach(product => {
      const name = product.name.toLowerCase()
      const price = Number(product.price)
      const cycle = product.cycle as 'weekly' | 'monthly'

      if (name.includes('standard')) {
        prices.Standard[cycle] = price
      } else if (name.includes('elite')) {
        prices.Elite[cycle] = price
      }
    })
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-violet-500/30">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center border-b border-slate-800/50 sticky top-0 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Apollyon Cloud Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Apollyon Cloud
          </span>
        </div>

        {user ? (
          <Link href="/dashboard" className="px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-500 border border-violet-500 transition-all text-sm font-medium shadow-lg shadow-violet-500/20">
            Ir para Dashboard
          </Link>
        ) : (
          <form action={signInWithDiscord}>
            <button className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-sm font-medium">
              Entrar com Discord
            </button>
          </form>
        )}
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px] -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
          </span>
          Infraestrutura Next-Gen Disponível
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Poder Computacional <br />
          <span className="text-violet-500">Sem Limites Físicos</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Acesse máquinas virtuais de alta performance instantaneamente. Jogue, renderize e processe dados pesados sem investir em hardware caro.
        </p>
        {user ? (
          hasActiveSubscription ? (
            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-green-500/20 transition-all hover:scale-105"
            >
              Acessar Minha Máquina
            </Link>
          ) : (
            <Link
              href="#pricing"
              className="inline-block px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-violet-500/20 transition-all hover:scale-105"
            >
              Escolher Plano
            </Link>
          )
        ) : (
          <form action={signInWithDiscord}>
            <button className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-violet-500/20 transition-all hover:scale-105">
              Começar Agora
            </button>
          </form>
        )}
      </section>

      {/* About Section */}
      <section className="py-20 bg-slate-900/30 border-y border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Sobre a Apollyon Cloud</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              A Apollyon Cloud redefine a virtualização de alto desempenho. Fundada em 2025, nossa missão é entregar poder computacional bruto, estabilidade inigualável e liberdade total para criadores e gamers.
            </p>
            <p className="text-slate-400 leading-relaxed mb-10">
              Nossa infraestrutura otimizada elimina barreiras de hardware, oferecendo ambientes Windows 10 Pro prontos para qualquer desafio — do gaming competitivo ao desenvolvimento profissional. Na Apollyon, a nuvem é sua oficina, seu laboratório e seu território de domínio.
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                <Zap className="w-8 h-8 text-violet-500 mb-4" />
                <h3 className="font-semibold text-white mb-2">Performance Pura</h3>
                <p className="text-sm text-slate-400">Hardware virtualizado de última geração para máxima eficiência.</p>
              </div>
              <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                <Shield className="w-8 h-8 text-violet-500 mb-4" />
                <h3 className="font-semibold text-white mb-2">Segurança Total</h3>
                <p className="text-sm text-slate-400">Ambientes isolados e protegidos para seus dados e projetos.</p>
              </div>
              <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                <Server className="w-8 h-8 text-violet-500 mb-4" />
                <h3 className="font-semibold text-white mb-2">Uptime Garantido</h3>
                <p className="text-sm text-slate-400">Infraestrutura robusta disponível 24/7 para quando você precisar.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <div id="pricing">
        <PricingSection user={user} currentPlan={currentPlan} prices={prices} />
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-10 text-center border-t border-slate-800/50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2025 Apollyon Cloud. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-violet-400 transition-colors">
              Termos de Uso
            </Link>
            <a href="#" className="hover:text-violet-400 transition-colors">
              Suporte
            </a>
          </div>
        </div>
      </footer>

      {/* Popup de Anúncios */}
      {announcements && announcements.length > 0 && (
        <AnnouncementPopup announcements={announcements} />
      )}
    </main>
  )
}

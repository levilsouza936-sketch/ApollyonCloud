import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Zap } from 'lucide-react'

export default async function UpgradePage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Buscar assinatura ativa
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*, products(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    const subscription = subscriptions?.[0]

    // Se não tem assinatura ativa ou está expirada, redireciona para pricing
    if (!subscription || new Date(subscription.expires_at) < new Date()) {
        redirect('/#pricing')
    }

    // Detectar plano atual
    const currentPlan = subscription.products?.name || ''
    const currentExpires = new Date(subscription.expires_at)
    const now = new Date()
    const daysRemaining = Math.ceil((currentExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    const isCurrentlyWeekly = daysRemaining < 15
    const isStandard = currentPlan.toLowerCase().includes('standard')

    // Definir planos disponíveis baseado na hierarquia
    type Plan = {
        name: string
        tier: 'Standard' | 'Elite'
        cycle: 'weekly' | 'monthly'
        price: number
        features: string[]
    }

    const allPlans: Plan[] = [
        {
            name: 'Standard Semanal',
            tier: 'Standard',
            cycle: 'weekly',
            price: 45.99,
            features: ['4 vCPUs', '28 GB RAM', '250 GB SSD', 'Windows 10 Pro']
        },
        {
            name: 'Standard Mensal',
            tier: 'Standard',
            cycle: 'monthly',
            price: 89.90,
            features: ['4 vCPUs', '28 GB RAM', '250 GB SSD', 'Windows 10 Pro']
        },
        {
            name: 'Elite Semanal',
            tier: 'Elite',
            cycle: 'weekly',
            price: 74.99,
            features: ['8 vCPUs', '32 GB RAM', '250 GB SSD', 'Windows 10 Pro']
        },
        {
            name: 'Elite Mensal',
            tier: 'Elite',
            cycle: 'monthly',
            price: 129.90,
            features: ['8 vCPUs', '32 GB RAM', '250 GB SSD', 'Windows 10 Pro']
        }
    ]

    // Filtrar apenas upgrades válidos
    const availableUpgrades = allPlans.filter(plan => {
        // Regra 1: Elite sempre > Standard
        if (isStandard && plan.tier === 'Standard') {
            // Se é Standard, só pode mudar para ciclo maior
            return plan.cycle === 'monthly' && isCurrentlyWeekly
        }

        if (isStandard && plan.tier === 'Elite') {
            // Se é Standard, pode ir para qualquer Elite
            return true
        }

        if (!isStandard && plan.tier === 'Standard') {
            // Se já é Elite, nunca pode voltar para Standard
            return false
        }

        if (!isStandard && plan.tier === 'Elite') {
            // Se é Elite, só pode mudar para ciclo maior
            return plan.cycle === 'monthly' && isCurrentlyWeekly
        }

        return false
    })

    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-violet-500/30 py-10">
            <div className="container mx-auto px-4 max-w-5xl">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar para Dashboard
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Faça Upgrade do Seu Plano</h1>
                    <p className="text-slate-400 text-lg">
                        Plano atual: <span className="text-white font-semibold">{currentPlan}</span>
                    </p>
                </div>

                {availableUpgrades.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                        <div className="w-20 h-20 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Zap className="w-10 h-10 text-violet-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Você já está no plano máximo!</h2>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            Parabéns! Você já possui o melhor plano disponível: <strong className="text-white">Elite Mensal</strong>
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-colors"
                        >
                            Voltar para Dashboard
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl mb-8 flex gap-3">
                            <div className="text-sm text-orange-200">
                                <p className="font-medium mb-1">⚠️ Importante</p>
                                <p className="text-xs text-orange-300">
                                    Ao fazer upgrade, seu plano atual será <strong>cancelado imediatamente</strong> e você perderá os dias restantes. O novo plano começará hoje.
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableUpgrades.map((plan) => (
                                <div
                                    key={plan.name}
                                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-violet-500/50 transition-all"
                                >
                                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                    <div className="mb-6">
                                        <span className="text-3xl font-bold text-white">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                                        <span className="text-slate-400">/{plan.cycle === 'weekly' ? 'semana' : 'mês'}</span>
                                    </div>

                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                                                <Check className="w-4 h-4 text-violet-500 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={`/checkout?plan=${plan.tier}&cycle=${plan.cycle}`}
                                        className="block w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-center transition-all"
                                    >
                                        Fazer Upgrade
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </main>
    )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, RefreshCw } from 'lucide-react'

export default async function RenewPage() {
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

    // Se tem assinatura ativa e NÃO expirou, redireciona para upgrade
    if (subscription && new Date(subscription.expires_at) > new Date()) {
        redirect('/upgrade')
    }

    // Todos os planos disponíveis (livre escolha!)
    const allPlans = [
        {
            name: 'Standard Semanal',
            tier: 'Standard',
            cycle: 'weekly',
            price: 45.99,
            features: ['4 vCPUs', '28 GB RAM', '250 GB SSD', 'Windows 10 Pro'],
            recommended: false
        },
        {
            name: 'Standard Mensal',
            tier: 'Standard',
            cycle: 'monthly',
            price: 89.90,
            features: ['4 vCPUs', '28 GB RAM', '250 GB SSD', 'Windows 10 Pro'],
            recommended: false
        },
        {
            name: 'Elite Semanal',
            tier: 'Elite',
            cycle: 'weekly',
            price: 74.99,
            features: ['8 vCPUs', '32 GB RAM', '250 GB SSD', 'Windows 10 Pro'],
            recommended: false
        },
        {
            name: 'Elite Mensal',
            tier: 'Elite',
            cycle: 'monthly',
            price: 129.90,
            features: ['8 vCPUs', '32 GB RAM', '250 GB SSD', 'Windows 10 Pro'],
            recommended: true
        }
    ]

    const previousPlan = subscription?.products?.name || 'seu plano anterior'

    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-violet-500/30 py-10">
            <div className="container mx-auto px-4 max-w-6xl">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar para Dashboard
                </Link>

                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <RefreshCw className="w-10 h-10 text-violet-500" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Renovar Sua Assinatura</h1>
                    <p className="text-slate-400 text-lg mb-2">
                        Sua assinatura <span className="text-white font-semibold">{previousPlan}</span> expirou
                    </p>
                    <p className="text-slate-500">
                        Escolha qualquer plano para continuar acessando sua máquina virtual
                    </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-8 flex gap-3">
                    <div className="text-sm text-blue-200">
                        <p className="font-medium mb-1">💡 Livre Escolha</p>
                        <p className="text-xs text-blue-300">
                            Como sua assinatura expirou, você pode escolher <strong>qualquer plano</strong> - até um mais barato que o anterior!
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {allPlans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`bg-slate-900 border rounded-2xl p-6 hover:border-violet-500/50 transition-all relative ${plan.recommended ? 'border-violet-500' : 'border-slate-800'
                                }`}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-1 bg-violet-500 text-white text-xs font-bold rounded-full">
                                        RECOMENDADO
                                    </span>
                                </div>
                            )}

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
                                className={`block w-full py-3 text-white rounded-xl font-semibold text-center transition-all ${plan.recommended
                                        ? 'bg-violet-600 hover:bg-violet-500'
                                        : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                            >
                                Escolher {plan.tier}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}

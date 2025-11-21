'use client'

import { useState } from 'react'
import { Check, Cpu, Server, HardDrive, Zap } from 'lucide-react'
import { signInWithDiscord } from '@/app/actions'
import { useRouter } from 'next/navigation'

type User = {
    id: string
    email?: string
} | null

type CurrentPlan = {
    tier: 'Standard' | 'Elite'
    cycle: 'weekly' | 'monthly'
} | null

type Prices = {
    Standard: { weekly: number; monthly: number }
    Elite: { weekly: number; monthly: number }
}

export default function PricingSection({ user, currentPlan, prices }: { user: User; currentPlan: CurrentPlan; prices: Prices }) {
    const [billingCycle, setBillingCycle] = useState<'weekly' | 'monthly'>('monthly')
    const router = useRouter()

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const handleSubscribe = (plan: 'Standard' | 'Elite') => {
        if (!user) {
            signInWithDiscord()
        } else {
            router.push(`/checkout?plan=${plan}&cycle=${billingCycle}`)
        }
    }

    // Standard Semanal: bloqueia se for plano atual OU se tem Standard Mensal (downgrade) OU se tem Elite
    const isStandardWeeklyDisabled =
        (currentPlan?.tier === 'Standard' && currentPlan?.cycle === 'weekly') || // Plano atual
        (currentPlan?.tier === 'Standard' && currentPlan?.cycle === 'monthly') || // Seria downgrade
        (currentPlan?.tier === 'Elite') // Tem Elite, não pode voltar
    const isStandardWeeklyCurrent = currentPlan?.tier === 'Standard' && currentPlan?.cycle === 'weekly'

    // Standard Mensal: bloqueia se for plano atual OU se tem Elite
    const isStandardMonthlyDisabled =
        (currentPlan?.tier === 'Standard' && currentPlan?.cycle === 'monthly') || // Plano atual
        (currentPlan?.tier === 'Elite') // Tem Elite, não pode voltar
    const isStandardMonthlyCurrent = currentPlan?.tier === 'Standard' && currentPlan?.cycle === 'monthly'

    // Determinar qual botão Standard mostrar baseado no ciclo
    const isStandardDisabled = billingCycle === 'weekly' ? isStandardWeeklyDisabled : isStandardMonthlyDisabled
    const isStandardCurrent = billingCycle === 'weekly' ? isStandardWeeklyCurrent : isStandardMonthlyCurrent

    // Elite Semanal: bloqueia se for plano atual OU se tem Elite Mensal (downgrade)
    const isEliteWeeklyDisabled =
        (currentPlan?.tier === 'Elite' && currentPlan?.cycle === 'weekly') || // Plano atual
        (currentPlan?.tier === 'Elite' && currentPlan?.cycle === 'monthly')   // Seria downgrade
    const isEliteWeeklyCurrent = currentPlan?.tier === 'Elite' && currentPlan?.cycle === 'weekly'

    // Elite Mensal: bloqueia apenas se for plano atual (já é o máximo!)
    const isEliteMonthlyDisabled = currentPlan?.tier === 'Elite' && currentPlan?.cycle === 'monthly'
    const isEliteMonthlyCurrent = isEliteMonthlyDisabled

    // Determinar qual botão Elite mostrar baseado no ciclo
    const isEliteDisabled = billingCycle === 'weekly' ? isEliteWeeklyDisabled : isEliteMonthlyDisabled
    const isEliteCurrent = billingCycle === 'weekly' ? isEliteWeeklyCurrent : isEliteMonthlyCurrent

    return (
        <section className="container mx-auto px-4 py-20">
            <h2 className="text-3xl font-bold text-center mb-8">Escolha Seu Poder de Fogo</h2>

            {/* Toggle Semanal/Mensal */}
            <div className="flex justify-center mb-16">
                <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex relative">
                    <button
                        onClick={() => setBillingCycle('weekly')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'weekly'
                            ? 'bg-slate-800 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Semanal
                    </button>
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'monthly'
                            ? 'bg-violet-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Mensal
                        {billingCycle === 'monthly' && (
                            <span className="absolute -top-3 -right-3 px-2 py-0.5 bg-green-500 text-xs font-bold rounded-full text-slate-950 border border-slate-900">
                                -10%
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Plan Standard */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-slate-600 transition-all relative group flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold mb-2 text-white">Máquina Standard</h3>
                        <p className="text-slate-400">Ideal para tarefas diárias e jogos leves.</p>
                    </div>

                    <div className="space-y-4 mb-8 flex-grow">
                        <div className="flex items-center gap-3 text-slate-300">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <Cpu className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Processador</p>
                                <p className="font-medium">4 vCPUs</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <Server className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Memória RAM</p>
                                <p className="font-medium">28 GB</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <HardDrive className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Armazenamento</p>
                                <p className="font-medium">250 GB SSD</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Sistema</p>
                                <p className="font-medium">Windows 10 Pro</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 mb-6">
                        <div className="flex justify-between items-end">
                            <span className="text-slate-400 mb-1">Preço {billingCycle === 'weekly' ? 'Semanal' : 'Mensal'}</span>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-white">
                                    {formatPrice(prices.Standard[billingCycle])}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => handleSubscribe('Standard')}
                        disabled={isStandardDisabled}
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${isStandardCurrent
                            ? 'bg-green-500/20 border border-green-500/50 text-green-400 cursor-not-allowed'
                            : isStandardDisabled
                                ? 'bg-slate-800/50 border border-slate-700/50 text-slate-500 cursor-not-allowed opacity-50'
                                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white'
                            }`}
                    >
                        {isStandardCurrent
                            ? '✓ Plano Atual'
                            : isStandardDisabled
                                ? 'Indisponível (Faça Upgrade)'
                                : user ? 'Selecionar Standard' : 'Entrar para Assinar'}
                    </button>
                </div>

                {/* Plan Elite */}
                <div className="bg-slate-900/80 border border-violet-500/30 rounded-2xl p-8 relative shadow-2xl shadow-violet-500/10 flex flex-col">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-violet-600 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                        Recomendado
                    </div>
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold mb-2 text-white">Máquina Elite</h3>
                        <p className="text-slate-400">Performance extrema para power users.</p>
                    </div>

                    <div className="space-y-4 mb-8 flex-grow">
                        <div className="flex items-center gap-3 text-slate-300">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                                <Cpu className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Processador</p>
                                <p className="font-medium text-white">8 vCPUs</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                                <Server className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Memória RAM</p>
                                <p className="font-medium text-white">32 GB</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                                <HardDrive className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Armazenamento</p>
                                <p className="font-medium text-white">250 GB SSD</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Sistema</p>
                                <p className="font-medium text-white">Windows 10 Pro</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950/50 rounded-xl p-4 border border-violet-500/30 mb-6">
                        <div className="flex justify-between items-end">
                            <span className="text-slate-400 mb-1">Preço {billingCycle === 'weekly' ? 'Semanal' : 'Mensal'}</span>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-violet-400">
                                    {formatPrice(prices.Elite[billingCycle])}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => handleSubscribe('Elite')}
                        disabled={isEliteDisabled}
                        className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all ${isEliteCurrent
                            ? 'bg-green-500/20 border border-green-500/50 text-green-400 cursor-not-allowed shadow-none'
                            : isEliteDisabled
                                ? 'bg-slate-800/50 border border-slate-700/50 text-slate-500 cursor-not-allowed opacity-50 shadow-none'
                                : 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/25 text-white'
                            }`}
                    >
                        {isEliteCurrent
                            ? '✓ Plano Atual'
                            : isEliteDisabled
                                ? 'Indisponível (Plano Máximo)'
                                : user ? 'Selecionar Elite' : 'Entrar para Assinar'}
                    </button>
                </div>
            </div>
        </section>
    )
}

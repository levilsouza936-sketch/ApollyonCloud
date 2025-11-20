import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ExternalLink, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react'

export default async function Dashboard() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Buscar perfil e assinatura
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()



    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*, products(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    const subscription = subscriptions?.[0] || null

    // Calcular estados da assinatura
    const now = new Date()
    const isExpired = subscription && new Date(subscription.expires_at) < now

    // Grace period: 24 horas após expirar
    const gracePeriodHours = 24
    let isInGracePeriod = false
    let isCancelled = false

    if (isExpired) {
        const expiresAt = new Date(subscription.expires_at)
        const hoursSinceExpired = (now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60)
        isInGracePeriod = hoursSinceExpired <= gracePeriodHours
        isCancelled = hoursSinceExpired > gracePeriodHours
    }

    // Calcular próximo upgrade lógico (só se ativa)
    let nextUpgrade: { plan: string; cycle: string; label: string } | null = null

    if (subscription && !isExpired) {
        const currentPlan = subscription.products?.name || ''
        const currentExpires = new Date(subscription.expires_at)
        const daysRemaining = Math.ceil((currentExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Determinar ciclo atual (aproximação: < 15 dias = semanal, >= 15 = mensal)
        const isCurrentlyWeekly = daysRemaining < 15

        const isStandard = currentPlan.toLowerCase().includes('standard')
        const isElite = currentPlan.toLowerCase().includes('elite')

        if (isStandard && isCurrentlyWeekly) {
            // Standard Semanal → Standard Mensal
            nextUpgrade = { plan: 'Standard', cycle: 'monthly', label: 'Standard Mensal (R$ 89,90)' }
        } else if (isStandard && !isCurrentlyWeekly) {
            // Standard Mensal → Elite Mensal
            nextUpgrade = { plan: 'Elite', cycle: 'monthly', label: 'Elite Mensal (R$ 129,90)' }
        } else if (isElite && isCurrentlyWeekly) {
            // Elite Semanal → Elite Mensal
            nextUpgrade = { plan: 'Elite', cycle: 'monthly', label: 'Elite Mensal (R$ 129,90)' }
        }
        // Se Elite Mensal → nextUpgrade fica null (já está no topo!)
    }

    const signOut = async () => {
        'use server'
        const supabase = createClient()
        await supabase.auth.signOut()
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <nav className="border-b border-slate-800 bg-slate-900/50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-bold text-xl">Apollyon Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-white">{user.user_metadata.full_name || 'Usuário'}</p>
                                <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                            {user.user_metadata.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full border border-slate-700"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                                    {user.email?.[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <form action={signOut}>
                            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white" title="Sair">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-10">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* Status Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-violet-500" />
                            Status da Assinatura
                        </h2>

                        {subscription && !isExpired ? (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                                    <div>
                                        <p className="text-sm text-violet-300 mb-1">Plano Ativo</p>
                                        <p className="text-2xl font-bold text-white">
                                            {subscription.products?.name || 'Plano Personalizado'}
                                        </p>
                                    </div>
                                    <div className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/20">
                                        Ativo
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-800/50 rounded-xl">
                                        <p className="text-sm text-slate-400 mb-1">Vencimento</p>
                                        <p className="font-medium">
                                            {new Date(subscription.expires_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-800/50 rounded-xl">
                                        <p className="text-sm text-slate-400 mb-1">ID do Cliente</p>
                                        <p className="font-medium font-mono text-sm truncate">
                                            {profile?.discord_id || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-800">
                                    <h3 className="text-lg font-medium mb-4">Como acessar sua máquina?</h3>
                                    <a
                                        href="https://discord.gg/seu-link-aqui"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-semibold transition-all"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                        Entrar no Discord da Apollyon
                                    </a>
                                    <p className="text-center text-sm text-slate-500 mt-4">
                                        Abra um ticket no canal #suporte para receber seus dados de acesso.
                                    </p>
                                </div>



                                {nextUpgrade && (
                                    <div className="pt-6 border-t border-slate-800">
                                        <h3 className="text-lg font-medium mb-3">Quer fazer upgrade?</h3>
                                        <p className="text-sm text-slate-400 mb-4">
                                            Mude para um plano superior e aproveite mais recursos.
                                        </p>
                                        <Link
                                            href="/upgrade"
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-semibold transition-all"
                                        >
                                            Ver Opções de Upgrade
                                        </Link>
                                        <p className="text-center text-xs text-slate-500 mt-3">
                                            Seu plano atual será cancelado e o novo começará imediatamente.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : subscription && isInGracePeriod ? (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                                    <div>
                                        <p className="text-sm text-orange-300 mb-1">Assinatura Expirada</p>
                                        <p className="text-2xl font-bold text-white">
                                            {subscription.products?.name || 'Plano Personalizado'}
                                        </p>
                                    </div>
                                    <div className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm font-medium rounded-full border border-orange-500/20">
                                        Grace Period
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-800/50 rounded-xl">
                                    <p className="text-sm text-slate-400 mb-1">Data de Expiração</p>
                                    <p className="font-medium">
                                        {new Date(subscription.expires_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>

                                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
                                    <p className="text-sm text-orange-200 font-medium mb-2">
                                        ⏰ Você tem 24 horas para renovar!
                                    </p>
                                    <p className="text-xs text-orange-300">
                                        Renove agora e <strong>mantenha seus dados</strong>. Após 24 horas, sua assinatura será <strong>cancelada</strong> e você perderá acesso aos dados da VM.
                                    </p>
                                </div>

                                <div className="text-center py-6 border-t border-slate-800">
                                    <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Renove sua assinatura agora!</h3>
                                    <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                                        Escolha um novo plano e mantenha seus dados salvos.
                                    </p>
                                    <Link
                                        href="/renew"
                                        className="inline-flex px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold transition-colors"
                                    >
                                        Renovar Assinatura
                                    </Link>
                                </div>
                            </div>
                        ) : subscription && isCancelled ? (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <div>
                                        <p className="text-sm text-red-300 mb-1">Assinatura Cancelada</p>
                                        <p className="text-2xl font-bold text-white">
                                            {subscription.products?.name || 'Plano Personalizado'}
                                        </p>
                                    </div>
                                    <div className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-medium rounded-full border border-red-500/20">
                                        Cancelada
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-800/50 rounded-xl">
                                    <p className="text-sm text-slate-400 mb-1">Data de Cancelamento</p>
                                    <p className="font-medium">
                                        {new Date(subscription.expires_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>

                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                                    <p className="text-sm text-red-200 font-medium mb-2">
                                        🗑️ Seus dados foram deletados
                                    </p>
                                    <p className="text-xs text-red-300">
                                        Sua assinatura foi cancelada após o período de grace. Todos os dados da máquina virtual foram <strong>deletados permanentemente</strong>.
                                    </p>
                                </div>

                                <div className="text-center py-6 border-t border-slate-800">
                                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Assinatura Cancelada</h3>
                                    <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                                        Escolha um novo plano para começar novamente com uma VM limpa.
                                    </p>
                                    <Link
                                        href="/#pricing"
                                        className="inline-flex px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-colors"
                                    >
                                        Ver Planos Disponíveis
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-slate-500" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">Nenhuma assinatura ativa</h3>
                                <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                                    Você ainda não possui uma máquina virtual ativa. Escolha um plano para começar.
                                </p>
                                <Link
                                    href="/"
                                    className="inline-flex px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-colors"
                                >
                                    Ver Planos
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    )
}

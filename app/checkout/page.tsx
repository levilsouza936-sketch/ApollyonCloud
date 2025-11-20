import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Lock, AlertTriangle } from 'lucide-react'
import { handleCheckout } from './actions'

export default async function Checkout({
    searchParams,
}: {
    searchParams: { plan?: string; cycle?: string; error?: string; details?: string }
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    const planName = searchParams.plan || 'Standard'
    const cycle = searchParams.cycle || 'monthly'
    const error = searchParams.error
    const errorDetails = searchParams.details

    const isElite = planName === 'Elite'
    const isMonthly = cycle === 'monthly'

    const price = isElite
        ? (isMonthly ? 129.90 : 74.99)
        : (isMonthly ? 89.90 : 1.00)

    // Verificar se há assinatura ativa (para mostrar aviso de upgrade)
    const { data: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('id, status, expires_at, products!inner(name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    const hasActiveSubscription = activeSubscriptions && activeSubscriptions.length > 0
        && new Date(activeSubscriptions[0].expires_at) > new Date()
    const currentPlan = hasActiveSubscription && activeSubscriptions[0].products
        ? String((activeSubscriptions[0].products as any).name || 'seu plano atual')
        : null

    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-violet-500/30 py-10">
            <div className="container mx-auto px-4 max-w-lg">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Cancelar e Voltar
                </Link>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-center">
                        <p className="font-bold flex items-center justify-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Erro ao iniciar pagamento
                        </p>
                        <p className="text-sm opacity-80 mt-1">O Mercado Pago recusou a criação do pedido.</p>
                        {errorDetails && (
                            <div className="mt-3 text-xs font-mono bg-black/30 p-3 rounded text-left overflow-x-auto">
                                {decodeURIComponent(errorDetails)}
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Lock className="w-6 h-6 text-violet-500" />
                        Checkout Seguro
                    </h1>

                    <div className="space-y-6 mb-8">
                        {hasActiveSubscription && (
                            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-orange-200 font-medium mb-1">
                                        ⚠️ Atenção: Upgrade de Plano
                                    </p>
                                    <p className="text-xs text-orange-300">
                                        Seu plano atual <strong>({currentPlan})</strong> será <strong>cancelado imediatamente</strong> e substituído por este novo plano. Você perderá os dias restantes do plano atual.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                            <p className="text-sm text-slate-400 mb-1">Você está contratando</p>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">Máquina {planName}</span>
                                <span className="px-2 py-1 bg-violet-500/10 text-violet-400 text-xs font-bold rounded uppercase">
                                    {isMonthly ? 'Mensal' : 'Semanal'}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-4 border-b border-slate-800">
                            <span className="text-slate-300">Total a pagar</span>
                            <span className="text-3xl font-bold text-white">
                                R$ {price.toFixed(2).replace('.', ',')}
                            </span>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3">
                            <CreditCard className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <p className="text-sm text-blue-200">
                                Você será redirecionado para o <strong>Mercado Pago</strong> para concluir o pagamento com segurança.
                            </p>
                        </div>
                    </div>

                    <form action={handleCheckout.bind(null, planName, cycle)}>
                        <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                            Pagar com Mercado Pago
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-500 mt-4">
                        Ambiente seguro e criptografado.
                    </p>
                </div>
            </div>
        </main>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function PaymentPending() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const startedAt = searchParams.get('startedAt')

    const [status, setStatus] = useState<'checking' | 'approved' | 'failed'>('checking')
    const [attempts, setAttempts] = useState(0)
    const maxAttempts = 60 // 5 minutos (5s * 60 = 300s)

    const checkPaymentStatus = async () => {
        try {
            const query = startedAt ? `?startedAt=${startedAt}` : ''
            const response = await fetch(`/api/check-subscription${query}`)
            const data = await response.json()

            if (data.hasActiveSubscription) {
                setStatus('approved')
                setTimeout(() => {
                    router.push('/dashboard')
                }, 2000)
            } else if (attempts >= maxAttempts) {
                setStatus('failed')
            }
        } catch (error) {
            console.error('Erro ao verificar pagamento:', error)
        }
    }

    useEffect(() => {
        // Iniciar verificação imediatamente
        checkPaymentStatus()

        // Configurar polling a cada 5 segundos
        const interval = setInterval(() => {
            setAttempts(prev => prev + 1)
            checkPaymentStatus()
        }, 5000)

        return () => clearInterval(interval)
    }, [attempts])

    return (
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                {status === 'checking' && (
                    <>
                        <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
                        <h1 className="text-2xl font-bold mb-2">Aguardando Confirmação</h1>
                        <p className="text-slate-400 mb-6">
                            Estamos verificando seu pagamento...
                        </p>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                            <p className="text-sm text-blue-200">
                                ⏱️ Esta página atualiza automaticamente a cada 5 segundos.
                                <br />
                                <strong>Não feche esta janela!</strong>
                            </p>
                        </div>
                        <p className="text-xs text-slate-500">
                            Tentativa {attempts + 1} de {maxAttempts}
                        </p>
                        <button
                            onClick={() => {
                                setAttempts(0)
                                checkPaymentStatus()
                            }}
                            className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
                        >
                            Verificar Agora
                        </button>
                    </>
                )}

                {status === 'approved' && (
                    <>
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2 text-green-400">Pagamento Aprovado!</h1>
                        <p className="text-slate-400">
                            Sua assinatura foi ativada com sucesso.
                            <br />
                            Redirecionando para o dashboard...
                        </p>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2 text-orange-400">Pagamento Pendente</h1>
                        <p className="text-slate-400 mb-6">
                            Ainda não identificamos seu pagamento.
                            <br />
                            Se você já pagou, aguarde alguns minutos.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setStatus('checking')
                                    setAttempts(0)
                                    checkPaymentStatus()
                                }}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors"
                            >
                                Tentar Novamente
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-colors"
                            >
                                Ir para o Dashboard
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    )
}

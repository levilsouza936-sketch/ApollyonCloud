'use client'

import { useState } from 'react'
import { manualVerifyPayment } from './actions'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function DebugPage() {
    const [paymentId, setPaymentId] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

    const handleVerify = async () => {
        if (!paymentId) return
        setLoading(true)
        setResult(null)

        try {
            const res = await manualVerifyPayment(paymentId)
            setResult(res)
        } catch (e) {
            setResult({ success: false, error: 'Erro ao chamar a verificação.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-white">Recuperação Manual de Pagamento</h1>

            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                <p className="text-zinc-400 mb-4">
                    Use esta ferramenta se o Webhook do Mercado Pago falhar. Insira o ID do pagamento (ex: 1234567890) para verificar o status e ativar a assinatura manualmente.
                </p>

                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        value={paymentId}
                        onChange={(e) => setPaymentId(e.target.value)}
                        placeholder="ID do Pagamento (Mercado Pago)"
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={handleVerify}
                        disabled={loading || !paymentId}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Verificar e Ativar
                    </button>
                </div>

                {result && (
                    <div className={`p-4 rounded border ${result.success ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            {result.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            <span className="font-bold">{result.success ? 'Sucesso!' : 'Erro'}</span>
                        </div>
                        <p>{result.success ? result.message : result.error}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

'use client'
// Componente de gerenciamento de assinatura de usuário

import { useState } from 'react'
import { updateSubscriptionStatus } from './actions'
import { Ban, CheckCircle } from 'lucide-react'

export default function UserSubscriptionManager({
    subscriptionId,
    currentStatus
}: {
    subscriptionId: string
    currentStatus: string
}) {
    const [loading, setLoading] = useState(false)

    const handleCancel = async () => {
        if (!confirm('Tem certeza que deseja cancelar esta assinatura?')) {
            return
        }

        setLoading(true)
        const result = await updateSubscriptionStatus(subscriptionId, 'cancelled')

        if (result.success) {
            alert('Assinatura cancelada com sucesso!')
        } else {
            alert('Erro ao cancelar: ' + result.error)
        }

        setLoading(false)
    }

    const handleReactivate = async () => {
        if (!confirm('Tem certeza que deseja reativar esta assinatura?')) {
            return
        }

        setLoading(true)
        const result = await updateSubscriptionStatus(subscriptionId, 'active')

        if (result.success) {
            alert('Assinatura reativada com sucesso!')
        } else {
            alert('Erro ao reativar: ' + result.error)
        }

        setLoading(false)
    }

    if (currentStatus === 'active') {
        return (
            <button
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 rounded text-sm transition-colors"
            >
                <Ban className="w-3 h-3" />
                {loading ? 'Cancelando...' : 'Cancelar'}
            </button>
        )
    }

    return (
        <button
            onClick={handleReactivate}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 rounded text-sm transition-colors"
        >
            <CheckCircle className="w-3 h-3" />
            {loading ? 'Reativando...' : 'Reativar'}
        </button>
    )
}

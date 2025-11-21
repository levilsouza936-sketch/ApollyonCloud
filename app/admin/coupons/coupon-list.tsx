'use client'
// Componente de lista de cupons

import { toggleCoupon } from './actions'
import { Tag, Clock, Users, ToggleLeft, ToggleRight } from 'lucide-react'

interface Coupon {
    id: string
    code: string
    discount_type: string
    discount_value: number
    max_uses: number | null
    used_count: number
    expires_at: string | null
    active: boolean
    created_at: string
}

export default function CouponList({ coupons }: { coupons: Coupon[] }) {
    const handleToggle = async (couponId: string, currentActive: boolean) => {
        const result = await toggleCoupon(couponId, !currentActive)
        if (result.success) {
            alert(!currentActive ? 'Cupom ativado!' : 'Cupom desativado!')
        } else {
            alert('Erro: ' + result.error)
        }
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Cupons Existentes</h3>

            {coupons.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Nenhum cupom criado ainda.</p>
            ) : (
                <div className="space-y-4">
                    {coupons.map((coupon) => {
                        const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date()
                        const isMaxedOut = coupon.max_uses && coupon.used_count >= coupon.max_uses

                        return (
                            <div
                                key={coupon.id}
                                className={`border rounded-lg p-4 ${coupon.active && !isExpired && !isMaxedOut
                                    ? 'border-green-500/50 bg-green-500/5'
                                    : 'border-slate-700 bg-slate-950/50'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-violet-400" />
                                        <span className="font-mono text-xl font-bold">{coupon.code}</span>
                                        {!coupon.active && (
                                            <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded">
                                                Inativo
                                            </span>
                                        )}
                                        {isExpired && (
                                            <span className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded">
                                                Expirado
                                            </span>
                                        )}
                                        {isMaxedOut && (
                                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded">
                                                Limite Atingido
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleToggle(coupon.id, coupon.active)}
                                        className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${coupon.active
                                            ? 'bg-red-600 hover:bg-red-500'
                                            : 'bg-green-600 hover:bg-green-500'
                                            }`}
                                    >
                                        {coupon.active ? (
                                            <>
                                                <ToggleRight className="w-4 h-4" />
                                                Desativar
                                            </>
                                        ) : (
                                            <>
                                                <ToggleLeft className="w-4 h-4" />
                                                Ativar
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-400">Desconto:</span>
                                        <span className="ml-2 font-bold text-green-400">
                                            {coupon.discount_type === 'percent'
                                                ? `${coupon.discount_value}%`
                                                : `R$ ${coupon.discount_value.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-400">Usos:</span>
                                        <span className="ml-1">
                                            {coupon.used_count}
                                            {coupon.max_uses ? ` / ${coupon.max_uses}` : ' / ∞'}
                                        </span>
                                    </div>
                                    {coupon.expires_at && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-400">Expira:</span>
                                            <span className="ml-1 text-xs">
                                                {new Date(coupon.expires_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

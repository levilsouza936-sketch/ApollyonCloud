'use client'
// Componente de formulário de cupom

import { useState } from 'react'
import { createCoupon } from './actions'
import { Plus } from 'lucide-react'

export default function CouponForm() {
    const [creating, setCreating] = useState(false)
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percent' as 'percent' | 'fixed',
        discount_value: 0,
        max_uses: '',
        expires_at: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)

        const result = await createCoupon({
            code: formData.code,
            discount_type: formData.discount_type,
            discount_value: Number(formData.discount_value),
            max_uses: formData.max_uses ? Number(formData.max_uses) : null,
            expires_at: formData.expires_at || null
        })

        if (result.success) {
            setFormData({
                code: '',
                discount_type: 'percent',
                discount_value: 0,
                max_uses: '',
                expires_at: ''
            })
            alert('Cupom criado com sucesso!')
        } else {
            alert('Erro ao criar cupom: ' + result.error)
        }

        setCreating(false)
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Criar Novo Cupom
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Código do Cupom</label>
                    <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="EX: PROMO10"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white uppercase"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-2">Tipo de Desconto</label>
                    <select
                        value={formData.discount_type}
                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percent' | 'fixed' })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                        <option value="percent">Porcentagem (%)</option>
                        <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-2">
                        Valor do Desconto {formData.discount_type === 'percent' ? '(%)' : '(R$)'}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-2">
                        Usos Máximos (deixe vazio para ilimitado)
                    </label>
                    <input
                        type="number"
                        value={formData.max_uses}
                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        placeholder="Ilimitado"
                    />
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-2">
                        Data de Expiração (opcional)
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.expires_at}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                </div>

                <button
                    type="submit"
                    disabled={creating}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 rounded-lg font-semibold transition-colors"
                >
                    {creating ? 'Criando...' : 'Criar Cupom'}
                </button>
            </form>
        </div>
    )
}

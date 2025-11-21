'use client'
// Componente de formulário de edição de produto

import { useState } from 'react'
import { updateProduct } from './actions'
import { Check, X } from 'lucide-react'

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    cycle: string | null
    active: boolean
}

export default function ProductEditForm({ product }: { product: Product }) {
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: product.name,
        description: product.description || '',
        price: product.price,
        cycle: product.cycle || 'monthly',
        active: product.active
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const result = await updateProduct(product.id, {
            ...formData,
            price: Number(formData.price)
        })

        if (result.success) {
            setEditing(false)
        } else {
            alert('Erro ao salvar: ' + result.error)
        }

        setSaving(false)
    }

    if (!editing) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold">{product.name}</h3>
                        <p className="text-slate-400 text-sm mt-1">{product.description}</p>
                    </div>
                    <button
                        onClick={() => setEditing(true)}
                        className="px-3 py-1 bg-violet-600 hover:bg-violet-500 rounded text-sm transition-colors"
                    >
                        Editar
                    </button>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Preço:</span>
                        <span className="font-bold">R$ {product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Ciclo:</span>
                        <span>{product.cycle}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className={product.active ? 'text-green-400' : 'text-red-400'}>
                            {product.active ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Editando: {product.name}</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Nome</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-2">Descrição</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        rows={2}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Preço (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Ciclo</label>
                        <select
                            value={formData.cycle}
                            onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                        >
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensal</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id={`active-${product.id}`}
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4"
                    />
                    <label htmlFor={`active-${product.id}`} className="text-sm">
                        Produto Ativo
                    </label>
                </div>
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 rounded-lg transition-colors"
                >
                    <Check className="w-4 h-4" />
                    {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                    Cancelar
                </button>
            </div>
        </form>
    )
}

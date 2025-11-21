'use client'

import { useState } from 'react'
import { createAnnouncement } from './actions'
import { Loader2, Plus } from 'lucide-react'

export default function AnnouncementForm() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_url: '',
        button_text: 'Ver Oferta',
        button_link: '',
        show_once_per_session: true,
        expires_at: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const result = await createAnnouncement({
            ...formData,
            expires_at: formData.expires_at || null
        })

        if (result.success) {
            alert('Anúncio criado com sucesso!')
            setFormData({
                title: '',
                description: '',
                image_url: '',
                button_text: 'Ver Oferta',
                button_link: '',
                show_once_per_session: true,
                expires_at: ''
            })
        } else {
            alert('Erro: ' + result.error)
        }

        setLoading(false)
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Criar Novo Anúncio
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Título *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="Ex: Promoção de Verão!"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Descrição</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="Descrição opcional da promoção..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">URL da Imagem *</label>
                    <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="https://exemplo.com/imagem.jpg"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Cole a URL de uma imagem hospedada (ex: Imgur, Google Drive, Supabase Storage)
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Texto do Botão</label>
                        <input
                            type="text"
                            value={formData.button_text}
                            onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Link do Botão</label>
                        <input
                            type="text"
                            value={formData.button_link}
                            onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="/checkout ou URL externa"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Data de Expiração (opcional)</label>
                    <input
                        type="datetime-local"
                        value={formData.expires_at}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="show_once"
                        checked={formData.show_once_per_session}
                        onChange={(e) => setFormData({ ...formData, show_once_per_session: e.target.checked })}
                        className="w-4 h-4"
                    />
                    <label htmlFor="show_once" className="text-sm text-slate-400">
                        Mostrar apenas uma vez por sessão
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Criando...
                        </>
                    ) : (
                        'Criar Anúncio'
                    )}
                </button>
            </form>
        </div>
    )
}

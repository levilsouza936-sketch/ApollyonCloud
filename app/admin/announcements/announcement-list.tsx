'use client'

import { toggleAnnouncement, deleteAnnouncement } from './actions'
import { Image as ImageIcon, ToggleLeft, ToggleRight, Trash2, ExternalLink, Clock } from 'lucide-react'

interface Announcement {
    id: string
    title: string
    description: string | null
    image_url: string
    button_text: string
    button_link: string | null
    active: boolean
    show_once_per_session: boolean
    expires_at: string | null
    created_at: string
}

export default function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
    const handleToggle = async (id: string, currentActive: boolean) => {
        const result = await toggleAnnouncement(id, !currentActive)
        if (result.success) {
            alert(!currentActive ? 'Anúncio ativado!' : 'Anúncio desativado!')
        } else {
            alert('Erro: ' + result.error)
        }
    }

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Tem certeza que deseja deletar o anúncio "${title}"?`)) return

        const result = await deleteAnnouncement(id)
        if (result.success) {
            alert('Anúncio deletado!')
        } else {
            alert('Erro: ' + result.error)
        }
    }

    if (announcements.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <p className="text-slate-400 text-center py-8">Nenhum anúncio criado ainda.</p>
            </div>
        )
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Anúncios Criados</h3>

            <div className="space-y-4">
                {announcements.map((ann) => {
                    const isExpired = ann.expires_at && new Date(ann.expires_at) < new Date()

                    return (
                        <div
                            key={ann.id}
                            className={`border rounded-lg p-4 ${ann.active && !isExpired
                                    ? 'border-green-500/50 bg-green-500/5'
                                    : 'border-slate-700 bg-slate-950/50'
                                }`}
                        >
                            <div className="flex gap-4">
                                {/* Preview da Imagem */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={ann.image_url}
                                        alt={ann.title}
                                        className="w-24 h-24 object-cover rounded border border-slate-700"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                        }}
                                    />
                                    <div className="hidden w-24 h-24 bg-slate-800 rounded border border-slate-700 flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-slate-600" />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-bold text-lg">{ann.title}</h4>
                                            {ann.description && (
                                                <p className="text-sm text-slate-400 mt-1">{ann.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleToggle(ann.id, ann.active)}
                                                className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${ann.active
                                                        ? 'bg-red-600 hover:bg-red-500'
                                                        : 'bg-green-600 hover:bg-green-500'
                                                    }`}
                                            >
                                                {ann.active ? (
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
                                            <button
                                                onClick={() => handleDelete(ann.id, ann.title)}
                                                className="px-3 py-1 rounded text-sm bg-slate-800 hover:bg-red-600 text-red-400 hover:text-white transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                                        {ann.button_link && (
                                            <div className="flex items-center gap-1">
                                                <ExternalLink className="w-3 h-3" />
                                                <span>Link: {ann.button_link}</span>
                                            </div>
                                        )}
                                        {ann.expires_at && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>
                                                    Expira: {new Date(ann.expires_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        )}
                                        {ann.show_once_per_session && (
                                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                                                Uma vez por sessão
                                            </span>
                                        )}
                                        {!ann.active && (
                                            <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded">
                                                Inativo
                                            </span>
                                        )}
                                        {isExpired && (
                                            <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded">
                                                Expirado
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

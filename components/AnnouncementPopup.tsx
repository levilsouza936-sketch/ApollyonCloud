'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface Announcement {
    id: string
    title: string
    description: string | null
    image_url: string
    button_text: string
    button_link: string | null
    show_once_per_session: boolean
}

export default function AnnouncementPopup({ announcements }: { announcements: Announcement[] }) {
    const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Esperar 2 segundos após carregar a página
        const timer = setTimeout(() => {
            // Filtrar anúncios que não foram vistos nesta sessão
            const validAnnouncements = announcements.filter((ann) => {
                if (ann.show_once_per_session) {
                    const seen = sessionStorage.getItem(`announcement_seen_${ann.id}`)
                    return !seen
                }
                return true
            })

            if (validAnnouncements.length > 0) {
                // Pegar o primeiro anúncio válido
                const selected = validAnnouncements[0]
                setCurrentAnnouncement(selected)
                setIsOpen(true)

                // Marcar como visto se for "mostrar uma vez por sessão"
                if (selected.show_once_per_session) {
                    sessionStorage.setItem(`announcement_seen_${selected.id}`, 'true')
                }
            }
        }, 2000)

        return () => clearTimeout(timer)
    }, [announcements])

    const handleClose = () => {
        setIsOpen(false)
    }

    const handleButtonClick = () => {
        if (currentAnnouncement?.button_link) {
            // Se for link externo (começa com http/https)
            if (currentAnnouncement.button_link.startsWith('http')) {
                window.open(currentAnnouncement.button_link, '_blank')
            } else {
                // Link interno
                window.location.href = currentAnnouncement.button_link
            }
        }
        handleClose()
    }

    if (!isOpen || !currentAnnouncement) return null

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={handleClose}
            />

            {/* Popup Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Botão Fechar */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors z-10"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    {/* Imagem */}
                    <div className="w-full h-64 overflow-hidden rounded-t-2xl">
                        <img
                            src={currentAnnouncement.image_url}
                            alt={currentAnnouncement.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Conteúdo */}
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {currentAnnouncement.title}
                        </h2>
                        {currentAnnouncement.description && (
                            <p className="text-slate-400 mb-6">
                                {currentAnnouncement.description}
                            </p>
                        )}

                        {/* Botões */}
                        <div className="flex gap-3">
                            {currentAnnouncement.button_link && (
                                <button
                                    onClick={handleButtonClick}
                                    className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/20"
                                >
                                    {currentAnnouncement.button_text}
                                </button>
                            )}
                            <button
                                onClick={handleClose}
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Buscar perfil do usuário para verificar role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <nav className="bg-slate-900 border-b border-slate-800">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-violet-400">
                            🛠️ Admin Panel - Apollyon Cloud
                        </h1>
                        <a href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                            Voltar para Dashboard
                        </a>
                    </div>
                </div>
            </nav>
            <div className="container mx-auto px-4 py-8">
                {children}
            </div>
        </div>
    )
}

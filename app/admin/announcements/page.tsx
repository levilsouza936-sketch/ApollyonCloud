import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AnnouncementForm from './announcement-form'
import AnnouncementList from './announcement-list'

export default async function AnnouncementsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Verificar se é admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    // Buscar anúncios
    const adminSupabase = createAdminClient()
    const { data: announcements } = await adminSupabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Gerenciar Anúncios Pop-up</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <AnnouncementForm />
                    </div>
                    <div className="lg:col-span-2">
                        <AnnouncementList announcements={announcements || []} />
                    </div>
                </div>
            </div>
        </div>
    )
}

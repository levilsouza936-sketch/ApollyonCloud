import { createAdminClient } from '@/utils/supabase/admin'
import AnnouncementForm from '@/app/admin/announcements/announcement-form'
import AnnouncementList from '@/app/admin/announcements/announcement-list'

export default async function AnnouncementSingularPage() {
    const supabase = createAdminClient()

    const { data: announcements } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold">Gerenciar Anúncios</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <AnnouncementForm />
                </div>
                <div className="lg:col-span-2">
                    <AnnouncementList announcements={announcements || []} />
                </div>
            </div>
        </div>
    )
}

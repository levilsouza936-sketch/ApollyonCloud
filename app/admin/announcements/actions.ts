'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createAnnouncement(data: {
    title: string
    description?: string
    image_url: string
    button_text?: string
    button_link?: string
    show_once_per_session?: boolean
    expires_at?: string | null
}) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('announcements')
        .insert({
            title: data.title,
            description: data.description || null,
            image_url: data.image_url,
            button_text: data.button_text || 'Ver Oferta',
            button_link: data.button_link || null,
            show_once_per_session: data.show_once_per_session ?? true,
            expires_at: data.expires_at || null,
            active: true
        })

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/announcements')
    revalidatePath('/')
    return { success: true }
}

export async function toggleAnnouncement(announcementId: string, active: boolean) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('announcements')
        .update({ active })
        .eq('id', announcementId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/announcements')
    revalidatePath('/')
    return { success: true }
}

export async function deleteAnnouncement(announcementId: string) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/announcements')
    revalidatePath('/')
    return { success: true }
}

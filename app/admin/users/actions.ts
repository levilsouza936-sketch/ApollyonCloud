'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateSubscriptionStatus(subscriptionId: string, status: 'active' | 'cancelled') {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('subscriptions')
        .update({ status })
        .eq('id', subscriptionId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
}

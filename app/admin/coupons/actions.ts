'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createCoupon(data: {
    code: string
    discount_type: 'percent' | 'fixed'
    discount_value: number
    max_uses?: number | null
    expires_at?: string | null
}) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('coupons')
        .insert({
            code: data.code.toUpperCase(),
            discount_type: data.discount_type,
            discount_value: data.discount_value,
            max_uses: data.max_uses || null,
            expires_at: data.expires_at || null,
            active: true,
            used_count: 0
        })

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/coupons')
    return { success: true }
}

export async function toggleCoupon(couponId: string, active: boolean) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('coupons')
        .update({ active })
        .eq('id', couponId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/coupons')
    return { success: true }
}

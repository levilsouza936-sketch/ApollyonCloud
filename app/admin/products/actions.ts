'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateProduct(productId: string, data: {
    name?: string
    description?: string
    price?: number
    cycle?: string
    active?: boolean
}) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', productId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/products')
    revalidatePath('/')
    return { success: true }
}

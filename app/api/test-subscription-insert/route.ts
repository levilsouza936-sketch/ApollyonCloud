import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'User not logged in' }, { status: 401 })
        }

        const adminSupabase = createAdminClient()

        // Buscar qualquer produto para teste
        const { data: product, error: productError } = await adminSupabase
            .from('products')
            .select('id, name')
            .limit(1)
            .single()

        if (productError || !product) {
            return NextResponse.json({ error: 'No products found', details: productError }, { status: 500 })
        }

        // Tentar inserir assinatura
        const subscriptionData = {
            user_id: user.id,
            status: 'active',
            product_id: product.id,
            expires_at: new Date(Date.now() + 1000 * 60 * 5).toISOString(), // 5 minutos
        }

        const { data: subscription, error: insertError } = await adminSupabase
            .from('subscriptions')
            .insert(subscriptionData)
            .select()

        if (insertError) {
            return NextResponse.json({ error: 'Insert failed', details: insertError }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription inserted successfully via Admin Client',
            subscription
        })

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Error', message: error.message }, { status: 500 })
    }
}

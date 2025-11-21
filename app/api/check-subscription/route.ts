import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ hasActiveSubscription: false }, { status: 200 })
    }

    // Verificar se há assinatura ativa
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('id, status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

    const hasActiveSubscription = subscriptions && subscriptions.length > 0
        && new Date(subscriptions[0].expires_at) > new Date()

    return NextResponse.json({
        hasActiveSubscription,
        subscription: subscriptions?.[0] || null
    })
}

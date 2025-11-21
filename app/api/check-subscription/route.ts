import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const startedAt = searchParams.get('startedAt')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ hasActiveSubscription: false }, { status: 200 })
    }

    // Verificar se há assinatura ativa
    let query = supabase
        .from('subscriptions')
        .select('id, status, expires_at, created_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

    // Se foi passado um timestamp de início, filtrar apenas assinaturas criadas DEPOIS dele
    if (startedAt) {
        query = query.gt('created_at', startedAt)
    }

    const { data: subscriptions } = await query

    const hasActiveSubscription = subscriptions && subscriptions.length > 0
        && new Date(subscriptions[0].expires_at) > new Date()

    return NextResponse.json({
        hasActiveSubscription,
        subscription: subscriptions?.[0] || null
    })
}

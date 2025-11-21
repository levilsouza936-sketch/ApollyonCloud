import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const startedAt = searchParams.get('startedAt')

    console.log(`CHECK-SUB: Verificando assinatura para startedAt: ${startedAt}`)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.log('CHECK-SUB: Usuário não autenticado')
        return NextResponse.json({ hasActiveSubscription: false }, { status: 200 })
    }

    console.log(`CHECK-SUB: Usuário autenticado: ${user.id}`)

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

    const { data: subscriptions, error } = await query

    if (error) {
        console.error('CHECK-SUB: Erro ao buscar assinaturas:', error)
    }

    console.log('CHECK-SUB: Assinaturas encontradas:', JSON.stringify(subscriptions))

    const hasActiveSubscription = subscriptions && subscriptions.length > 0
        && new Date(subscriptions[0].expires_at) > new Date()

    console.log(`CHECK-SUB: Resultado: ${hasActiveSubscription}`)

    return NextResponse.json({
        hasActiveSubscription,
        subscription: subscriptions?.[0] || null
    })
}

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    // Buscar as últimas 5 assinaturas criadas
    const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*, products(name)')
        .order('created_at', { ascending: false })
        .limit(5)

    return NextResponse.json({ subscriptions, error })
}

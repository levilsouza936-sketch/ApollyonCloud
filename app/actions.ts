'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signInWithDiscord() {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    })
    if (data.url) {
        redirect(data.url)
    }
}

export async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/')
}

export async function createMockSubscription(planName: string, cycle: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // 1. Verificar se há assinatura ativa e cancelá-la (para upgrade)
    const { data: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('id, status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    // Cancelar assinatura ativa se ainda estiver válida
    if (activeSubscriptions && activeSubscriptions.length > 0) {
        const latestActive = activeSubscriptions[0]
        const isStillValid = new Date(latestActive.expires_at) > new Date()

        if (isStillValid) {
            await supabase
                .from('subscriptions')
                .update({ status: 'cancelled' })
                .eq('id', latestActive.id)
        }
    }

    // 2. Buscar o produto no banco (pelo nome aproximado)
    const { data: product } = await supabase
        .from('products')
        .select('id')
        .ilike('name', `%${planName}%`)
        .single()

    if (!product) {
        console.error('Produto não encontrado')
        return
    }

    // 3. Calcular expiração (1 semana ou 1 mês)
    const expiresAt = new Date()
    if (cycle === 'weekly') {
        expiresAt.setDate(expiresAt.getDate() + 7)
    } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1)
    }

    // 4. Criar assinatura
    const { error } = await supabase
        .from('subscriptions')
        .insert({
            user_id: user.id,
            product_id: product.id,
            status: 'active',
            expires_at: expiresAt.toISOString(),
        })

    if (error) {
        console.error('Erro ao criar assinatura:', error)
        throw error
    }

    revalidatePath('/dashboard')
    revalidatePath('/')
    redirect('/checkout/success')
}

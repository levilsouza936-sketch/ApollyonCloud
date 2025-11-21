import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CheckoutClient from './checkout-client'

export default async function Checkout({
    searchParams,
}: {
    searchParams: { plan?: string; cycle?: string; error?: string; details?: string }
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    const planName = searchParams.plan || 'Standard'
    const cycle = searchParams.cycle || 'monthly'
    const error = searchParams.error
    const errorDetails = searchParams.details

    const isElite = planName === 'Elite'
    const isMonthly = cycle === 'monthly'

    // Buscar preço do produto no banco de dados
    const { data: product } = await supabase
        .from('products')
        .select('price')
        .ilike('name', `%${planName}%`)
        .eq('cycle', cycle)
        .eq('active', true)
        .single()

    const price = product ? Number(product.price) : 0

    if (!product) {
        // Fallback seguro ou redirecionamento se produto não existir
        console.error('Produto não encontrado para checkout:', planName, cycle)
    }

    // Verificar se há assinatura ativa (para mostrar aviso de upgrade)
    const { data: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('id, status, expires_at, products!inner(name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    const hasActiveSubscription = !!(activeSubscriptions && activeSubscriptions.length > 0
        && new Date(activeSubscriptions[0].expires_at) > new Date())
    const currentPlan = hasActiveSubscription && activeSubscriptions[0].products
        ? String((activeSubscriptions[0].products as any).name || 'seu plano atual')
        : null

    return (
        <CheckoutClient
            planName={planName}
            cycle={cycle}
            price={price}
            isMonthly={isMonthly}
            hasActiveSubscription={hasActiveSubscription}
            currentPlan={currentPlan}
            error={error}
            errorDetails={errorDetails}
        />
    )
}

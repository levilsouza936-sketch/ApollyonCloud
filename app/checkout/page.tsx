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

    const price = isElite
        ? (isMonthly ? 129.90 : 74.99)
        : (isMonthly ? 89.90 : 0.15)

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

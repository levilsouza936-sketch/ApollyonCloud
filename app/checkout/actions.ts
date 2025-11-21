'use server'

import { createMercadoPagoPreference } from '@/app/actions/mercadopago'

export async function handleCheckout(plan: string, cycle: string): Promise<{ url?: string, error?: string, details?: string }> {
    try {
        const url = await createMercadoPagoPreference(plan as 'Standard' | 'Elite', cycle as 'weekly' | 'monthly')
        return { url }
    } catch (error: any) {
        console.error('Erro no checkout:', error)

        let errorMessage = 'payment_creation_failed'
        let errorDetails = ''

        if (error?.message) errorDetails = error.message
        if (error?.cause) errorDetails += ` | ${JSON.stringify(error.cause)}`

        return {
            error: errorMessage,
            details: errorDetails.substring(0, 200)
        }
    }
}

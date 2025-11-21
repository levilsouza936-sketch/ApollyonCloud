'use server'

import { createMercadoPagoPreference, validateCoupon as validateCouponMP } from '@/app/actions/mercadopago'

export async function validateCoupon(code: string) {
    return await validateCouponMP(code)
}

export async function handleCheckout(plan: string, cycle: string, couponCode?: string): Promise<{ url?: string, error?: string, details?: string }> {
    try {
        const url = await createMercadoPagoPreference(plan, cycle, couponCode)
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

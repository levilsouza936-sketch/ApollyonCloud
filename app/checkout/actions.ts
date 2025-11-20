'use server'

import { createMercadoPagoPreference } from '@/app/actions/mercadopago'
import { redirect } from 'next/navigation'

export async function handleCheckout(plan: string, cycle: string) {
    let url = null

    try {
        url = await createMercadoPagoPreference(plan as 'Standard' | 'Elite', cycle as 'weekly' | 'monthly')
    } catch (error: any) {
        console.error('Erro no checkout:', error)
        // Extrair mensagem de erro útil
        let errorMessage = 'payment_creation_failed'
        let errorDetails = ''

        if (error?.message) errorDetails = error.message
        if (error?.cause) errorDetails += ` | ${JSON.stringify(error.cause)}`

        // Codificar para URL
        const params = new URLSearchParams()
        params.set('error', errorMessage)
        if (errorDetails) params.set('details', errorDetails.substring(0, 200)) // Limitar tamanho

        redirect(`/checkout?${params.toString()}`)
    }

    if (url) {
        redirect(url)
    }
}

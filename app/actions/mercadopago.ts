'use server'

import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Configura o cliente do Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
    options: { timeout: 5000 }
})

const PLANS = {
    'Standard': {
        'weekly': { price: 0.15, title: 'Apollyon Cloud - Standard Semanal (TESTE)' },
        'monthly': { price: 89.90, title: 'Apollyon Cloud - Standard Mensal' }
    },
    'Elite': {
        'weekly': { price: 74.99, title: 'Apollyon Cloud - Elite Semanal' },
        'monthly': { price: 129.90, title: 'Apollyon Cloud - Elite Mensal' }
    }
}

export async function createMercadoPagoPreference(plan: 'Standard' | 'Elite', cycle: 'weekly' | 'monthly') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Usuário não autenticado')
    }

    const selectedPlan = PLANS[plan][cycle]

    if (!selectedPlan) {
        throw new Error('Plano inválido')
    }

    // URL base para retorno do usuário (sempre localhost para manter a sessão)
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const preference = new Preference(client)

    try {
        const response = await preference.create({
            body: {
                items: [
                    {
                        id: `${plan.toLowerCase()}-${cycle}`,
                        title: selectedPlan.title,
                        quantity: 1,
                        unit_price: selectedPlan.price,
                        currency_id: 'BRL'
                    }
                ],
                payer: {
                    email: user.email
                },
                back_urls: {
                    success: `${origin}/dashboard?status=success`,
                    failure: `${origin}/checkout?status=failure`,
                    pending: `${origin}/checkout?status=pending`
                },
                auto_return: 'approved',
                notification_url: 'https://apollyoncloud.com/api/webhook',
                external_reference: user.id,
                metadata: {
                    user_id: user.id,
                    plan: plan,
                    cycle: cycle
                }
            }
        })

        console.log('Preferência criada com sucesso. Init Point:', response.init_point)

        if (!response.init_point) {
            throw new Error('Falha ao gerar link de pagamento')
        }

        return response.init_point

    } catch (error) {
        console.error('Erro CRÍTICO ao criar preferência MP:', error)
        // Logar detalhes específicos se for erro da API do MP
        if (typeof error === 'object' && error !== null && 'cause' in error) {
            console.error('Causa do erro MP:', (error as any).cause)
        }
        if (typeof error === 'object' && error !== null && 'message' in error) {
            console.error('Mensagem do erro MP:', (error as any).message)
        }
        throw error
    }
}

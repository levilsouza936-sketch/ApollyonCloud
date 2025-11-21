'use server'

import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

// Configura o cliente do Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
    options: { timeout: 5000 }
})

export async function validateCoupon(code: string) {
    const supabase = createAdminClient()

    const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('active', true)
        .single()

    if (error || !coupon) {
        return { valid: false, message: 'Cupom inválido' }
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return { valid: false, message: 'Cupom expirado' }
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return { valid: false, message: 'Limite de uso do cupom atingido' }
    }

    return { valid: true, coupon }
}

export async function createMercadoPagoPreference(
    plan: string,
    cycle: string,
    couponCode?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Usuário não autenticado')
    }

    // Buscar produto no banco de dados
    const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${plan}%`)
        .eq('cycle', cycle)
        .eq('active', true)
        .single()

    if (productError || !product) {
        console.error('Erro ao buscar produto:', productError)
        throw new Error('Produto indisponível ou não encontrado')
    }

    let finalPrice = Number(product.price)
    let couponId = null

    // Aplicar cupom se fornecido
    if (couponCode) {
        const { valid, coupon } = await validateCoupon(couponCode)
        if (valid && coupon) {
            couponId = coupon.id
            if (coupon.discount_type === 'percent') {
                finalPrice = finalPrice * (1 - (coupon.discount_value / 100))
            } else {
                finalPrice = Math.max(0, finalPrice - coupon.discount_value)
            }
        }
    }

    // URL base para retorno do usuário
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const preference = new Preference(client)

    try {
        const response = await preference.create({
            body: {
                items: [
                    {
                        id: product.id,
                        title: product.name,
                        quantity: 1,
                        unit_price: Number(finalPrice.toFixed(2)),
                        currency_id: 'BRL'
                    }
                ],
                payer: {
                    email: user.email
                },
                back_urls: {
                    success: `${origin}/payment-pending`,
                    failure: `${origin}/checkout?status=failure`,
                    pending: `${origin}/payment-pending`
                },
                auto_return: 'approved',
                notification_url: 'https://apollyoncloud.com/api/webhook',
                external_reference: user.id,
                metadata: {
                    user_id: user.id,
                    plan: plan,
                    cycle: cycle,
                    coupon_id: couponId,
                    original_price: product.price,
                    product_id: product.id
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
        throw error
    }
}

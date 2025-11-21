'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { revalidatePath } from 'next/cache'

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
    options: { timeout: 5000 }
})

export async function manualVerifyPayment(paymentId: string) {
    try {
        console.log(`MANUAL_VERIFY: Verificando pagamento ${paymentId}`)

        const paymentClient = new Payment(client)
        const payment = await paymentClient.get({ id: paymentId })

        if (!payment) {
            return { success: false, error: 'Pagamento não encontrado no Mercado Pago.' }
        }

        if (payment.status !== 'approved') {
            return { success: false, error: `Pagamento não está aprovado. Status: ${payment.status}` }
        }

        // Extrair dados
        const userId = payment.metadata?.user_id || payment.external_reference
        const plan = payment.metadata?.plan
        const cycle = payment.metadata?.cycle
        const productId = payment.metadata?.product_id

        if (!userId) {
            return { success: false, error: 'User ID não encontrado nos metadados do pagamento.' }
        }

        const supabase = createAdminClient()

        // Verificar se já existe assinatura para este pagamento (evitar duplicidade se possível, mas aqui é manual)
        // Vamos verificar se o usuário já tem assinatura ativa
        const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()

        if (existingSub) {
            return { success: false, error: 'Usuário já possui uma assinatura ativa.' }
        }

        // Buscar produto
        let product
        if (productId) {
            const { data: p } = await supabase.from('products').select('id, name').eq('id', productId).single()
            product = p
        }

        if (!product && plan) {
            const { data: p } = await supabase.from('products').select('id, name').ilike('name', `%${plan}%`).single()
            product = p
        }

        if (!product) {
            return { success: false, error: `Produto não encontrado (Plan: ${plan}, ID: ${productId})` }
        }

        // Calcular expiração
        const expiresAt = new Date()
        if (cycle === 'weekly') {
            expiresAt.setDate(expiresAt.getDate() + 7)
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1)
        }

        // Criar assinatura
        const { error: insertError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                status: 'active',
                product_id: product.id,
                expires_at: expiresAt.toISOString(),
            })

        if (insertError) {
            return { success: false, error: `Erro ao criar assinatura: ${insertError.message}` }
        }

        // Registrar pedido (opcional, mas bom para histórico)
        await supabase.from('orders').insert({
            user_id: userId,
            product_id: product.id,
            status: 'completed',
            payment_id: paymentId,
            amount: payment.transaction_amount,
            metadata: payment.metadata
        })

        revalidatePath('/admin/users')
        return { success: true, message: 'Assinatura ativada com sucesso!' }

    } catch (error: any) {
        console.error('MANUAL_VERIFY_ERROR:', error)
        return { success: false, error: error.message || 'Erro interno ao verificar pagamento.' }
    }
}

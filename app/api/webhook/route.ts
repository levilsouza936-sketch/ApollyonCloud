import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment, MerchantOrder } from 'mercadopago'
import { createClient } from '@/utils/supabase/server'

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
    options: { timeout: 5000 }
})

export async function POST(request: Request) {
    console.log('WEBHOOK: Método da requisição:', request.method)
    try {
        console.log('========================================')
        console.log('WEBHOOK: Recebido POST')
        // Parsear o corpo da requisição
        const body = await request.json()
        // Extrair paymentId (pode vir de payment ou merchant_order)
        let paymentId: string | undefined
        if (body.type === 'payment') {
            paymentId = body.data?.id
        } else if (body.type === 'merchant_order' && body.resource) {
            const parts = body.resource.split('/')
            const merchantOrderId = parts[parts.length - 1]
            console.log(`WEBHOOK: Buscando merchant_order ${merchantOrderId}`)
            try {
                const merchantOrderClient = new MerchantOrder(client)
                const merchantOrder = await merchantOrderClient.get(merchantOrderId)
                if (merchantOrder && merchantOrder.payments && merchantOrder.payments.length > 0) {
                    paymentId = String(merchantOrder.payments[0].id)
                }
            } catch (e) {
                console.error('WEBHOOK: Erro ao buscar merchant_order', e)
            }
        }
        if (!paymentId) {
            console.log(`WEBHOOK: Evento ignorado (sem paymentId) tipo: ${body.type}`)
            return NextResponse.json({ received: true, ignored: true }, { status: 200 })
        }


        console.log(`WEBHOOK: ✅ Processando pagamento ID: ${paymentId}`)
        console.log(`WEBHOOK: Action: ${body.action}`)

        // Buscar informações do pagamento no Mercado Pago
        const paymentClient = new Payment(client)
        let payment

        try {
            console.log(`WEBHOOK: Buscando pagamento ${paymentId} na API do MP...`)
            payment = await paymentClient.get({ id: paymentId })
            console.log(`WEBHOOK: ✅ Pagamento encontrado!`)
            console.log(`WEBHOOK: Status: ${payment.status}`)
            console.log(`WEBHOOK: Status Detail: ${payment.status_detail}`)
            console.log(`WEBHOOK: Payment Method: ${payment.payment_method_id}`)
            console.log(`WEBHOOK: Amount: ${payment.transaction_amount}`)
            console.log(`WEBHOOK: Payer Email: ${payment.payer?.email}`)
            console.log(`WEBHOOK: External Reference: ${payment.external_reference}`)
            console.log(`WEBHOOK: Metadata completo:`, JSON.stringify(payment.metadata, null, 2))
        } catch (error: any) {
            console.error(`WEBHOOK: ❌ Erro ao buscar pagamento ${paymentId}:`, error?.message || error)
            return NextResponse.json({ received: true, error: 'payment_fetch_failed' }, { status: 200 })
        }

        // Processar apenas pagamentos aprovados
        if (payment.status !== 'approved') {
            console.log(`WEBHOOK: ⏳ Pagamento não aprovado ainda (status: ${payment.status})`)
            return NextResponse.json({ received: true, status: payment.status }, { status: 200 })
        }

        console.log('WEBHOOK: 🎉 Pagamento APROVADO! Processando assinatura...')

        // Extrair metadados
        const userId = payment.metadata?.user_id || payment.external_reference
        const plan = payment.metadata?.plan
        const cycle = payment.metadata?.cycle

        console.log('WEBHOOK: Metadados extraídos:')
        console.log(`  - User ID: ${userId}`)
        console.log(`  - Plan: ${plan}`)
        console.log(`  - Cycle: ${cycle}`)

        if (!userId) {
            console.error('WEBHOOK: ❌ user_id ausente nos metadados E no external_reference')
            return NextResponse.json({ received: true, error: 'missing_user_id' }, { status: 200 })
        }

        if (!plan) {
            console.error('WEBHOOK: ❌ plan ausente nos metadados')
            return NextResponse.json({ received: true, error: 'missing_plan' }, { status: 200 })
        }

        if (!cycle) {
            console.error('WEBHOOK: ❌ cycle ausente nos metadados')
            return NextResponse.json({ received: true, error: 'missing_cycle' }, { status: 200 })
        }

        // Conectar ao Supabase
        console.log('WEBHOOK: Conectando ao Supabase...')
        const supabase = await createClient()

        // Calcular data de expiração
        const expiresAt = new Date()
        if (cycle === 'weekly') {
            expiresAt.setDate(expiresAt.getDate() + 7)
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1)
        }
        console.log(`WEBHOOK: Data de expiração calculada: ${expiresAt.toISOString()}`)

        // Buscar produto
        console.log(`WEBHOOK: Buscando produto com name ILIKE '%${plan}%'...`)
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, name')
            .ilike('name', `%${plan}%`)
            .single()

        if (productError) {
            console.error('WEBHOOK: ❌ Erro ao buscar produto:', productError)
            return NextResponse.json({ received: true, error: 'product_query_error', details: productError }, { status: 200 })
        }

        if (!product) {
            console.error(`WEBHOOK: ❌ Produto não encontrado com name ILIKE '%${plan}%'`)

            // Listar todos os produtos para debug
            const { data: allProducts } = await supabase.from('products').select('id, name')
            console.log('WEBHOOK: Produtos disponíveis no banco:', JSON.stringify(allProducts, null, 2))

            return NextResponse.json({ received: true, error: 'product_not_found' }, { status: 200 })
        }

        console.log(`WEBHOOK: ✅ Produto encontrado: ${product.name} (ID: ${product.id})`)

        // Criar assinatura
        console.log('WEBHOOK: Inserindo assinatura no banco de dados...')
        const subscriptionData = {
            user_id: userId,
            status: 'active',
            product_id: product.id,
            expires_at: expiresAt.toISOString(),

        }
        console.log('WEBHOOK: Dados da assinatura:', JSON.stringify(subscriptionData, null, 2))

        const { data: subscription, error: insertError } = await supabase
            .from('subscriptions')
            .insert(subscriptionData)
            .select()

        if (insertError) {
            console.error('WEBHOOK: ❌ Erro ao inserir assinatura:', insertError)
            return NextResponse.json({ received: true, error: 'subscription_insert_failed', details: insertError }, { status: 200 })
        }

        console.log('WEBHOOK: ✅✅✅ ASSINATURA CRIADA COM SUCESSO! ✅✅✅')
        console.log('WEBHOOK: Assinatura:', JSON.stringify(subscription, null, 2))
        console.log('========================================')

        return NextResponse.json({
            received: true,
            status: 'subscription_created',
            subscription_id: subscription?.[0]?.id
        }, { status: 200 })

    } catch (error: any) {
        console.error('WEBHOOK: ❌❌❌ ERRO CRÍTICO ❌❌❌')
        console.error('WEBHOOK: Error:', error?.message || error)
        console.error('WEBHOOK: Stack:', error?.stack)
        console.log('========================================')

        // Sempre retornar 200 para evitar retry infinito do MP
        return NextResponse.json({ received: true, error: 'internal_error', message: error?.message }, { status: 200 })
    }
}

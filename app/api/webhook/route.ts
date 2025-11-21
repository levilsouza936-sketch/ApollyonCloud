import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@/utils/supabase/server'

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
    options: { timeout: 5000 }
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log('Webhook: Recebido:', JSON.stringify(body, null, 2))

        // Verificar se é evento de pagamento
        if (body.type !== 'payment') {
            console.log('Webhook: Evento ignorado (não é pagamento)')
            return NextResponse.json({ received: true }, { status: 200 })
        }

        const paymentId = body.data?.id
        if (!paymentId) {
            console.error('Webhook: ID de pagamento ausente')
            return NextResponse.json({ received: true }, { status: 200 })
        }

        console.log(`Webhook: Processando pagamento ${paymentId}`)

        // Buscar informações do pagamento no Mercado Pago
        const paymentClient = new Payment(client)
        let payment

        try {
            payment = await paymentClient.get({ id: paymentId })
            console.log(`Webhook: Pagamento encontrado. Status: ${payment.status}`)
        } catch (error) {
            console.error(`Webhook: Erro ao buscar pagamento ${paymentId}:`, error)
            // Retornar 200 para não ficar em loop de retry
            return NextResponse.json({ received: true, error: 'Payment not found' }, { status: 200 })
        }

        // Processar apenas pagamentos aprovados
        if (payment.status !== 'approved') {
            console.log(`Webhook: Pagamento ${paymentId} não aprovado (status: ${payment.status})`)
            return NextResponse.json({ received: true }, { status: 200 })
        }

        // Extrair metadados
        const userId = payment.metadata?.user_id
        const plan = payment.metadata?.plan
        const cycle = payment.metadata?.cycle

        console.log('Webhook: Metadados:', { userId, plan, cycle })

        if (!userId || !plan || !cycle) {
            console.error('Webhook: Metadados incompletos')
            return NextResponse.json({ received: true, error: 'Missing metadata' }, { status: 200 })
        }

        // Conectar ao Supabase
        const supabase = await createClient()

        // Calcular data de expiração
        const expiresAt = new Date()
        if (cycle === 'weekly') {
            expiresAt.setDate(expiresAt.getDate() + 7)
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1)
        }

        // Buscar produto
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id')
            .ilike('name', `%${plan}%`)
            .single()

        if (productError || !product) {
            console.error('Webhook: Produto não encontrado:', productError)
            return NextResponse.json({ received: true, error: 'Product not found' }, { status: 200 })
        }

        console.log(`Webhook: Produto ${plan} encontrado (ID: ${product.id})`)

        // Criar assinatura
        const { error: insertError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                status: 'active',
                product_id: product.id,
                expires_at: expiresAt.toISOString(),
                metadata: {
                    payment_id: paymentId,
                    cycle: cycle
                }
            })

        if (insertError) {
            console.error('Webhook: Erro ao criar assinatura:', insertError)
            return NextResponse.json({ received: true, error: 'Database error' }, { status: 200 })
        }

        console.log('Webhook: ✅ Assinatura criada com sucesso!')

        return NextResponse.json({ received: true, status: 'subscription_created' }, { status: 200 })

    } catch (error) {
        console.error('Webhook: Erro crítico:', error)
        // Sempre retornar 200 para evitar retry infinito do MP
        return NextResponse.json({ received: true, error: 'Internal error' }, { status: 200 })
    }
}

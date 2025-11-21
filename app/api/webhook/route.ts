import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
    options: { timeout: 5000 }
})

export async function POST(request: Request) {
    const body = await request.json()
    const headersList = headers()

    // Validação de segurança (Recomendado pelo Mercado Pago)
    // O x-signature contém ts e v1 (hash)
    const xSignature = headersList.get('x-signature')
    const xRequestId = headersList.get('x-request-id')

    if (!xSignature || !xRequestId) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Extrair partes da assinatura
    const parts = xSignature.split(',')
    let ts
    let hash

    parts.forEach(part => {
        const [key, value] = part.split('=')
        if (key && value) {
            const trimmedKey = key.trim()
            const trimmedValue = value.trim()
            if (trimmedKey === 'ts') {
                ts = trimmedValue
            } else if (trimmedKey === 'v1') {
                hash = trimmedValue
            }
        }
    })

    // Validar HMAC se o segredo estiver configurado
    const secret = process.env.MP_WEBHOOK_SECRET
    if (secret && ts && hash) {
        const manifest = `id:${body.data.id};request-id:${xRequestId};ts:${ts};`
        const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

        if (hmac !== hash) {
            console.error('Assinatura inválida')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }
    }

    // Processar evento
    if (body.type === 'payment') {
        const paymentId = body.data.id
        console.log(`Webhook: Recebido evento de pagamento ${paymentId}`)

        const paymentClient = new Payment(client)

        try {
            const payment = await paymentClient.get({ id: paymentId })
            console.log(`Webhook: Status do pagamento ${paymentId}: ${payment.status}`)

            if (payment.status === 'approved') {
                const userId = payment.metadata.user_id
                const plan = payment.metadata.plan
                const cycle = payment.metadata.cycle

                console.log('Webhook: Metadados extraídos:', { userId, plan, cycle })

                if (userId && plan && cycle) {
                    const supabase = await createClient()

                    // Calcular expiração
                    const expiresAt = new Date()
                    if (cycle === 'weekly') {
                        expiresAt.setDate(expiresAt.getDate() + 7)
                    } else {
                        expiresAt.setMonth(expiresAt.getMonth() + 1)
                    }

                    // Buscar ID do produto
                    const { data: product, error: productError } = await supabase
                        .from('products')
                        .select('id')
                        .ilike('name', `%${plan}%`) // Busca aproximada (Standard ou Elite)
                        .single()

                    if (productError || !product) {
                        console.error('Webhook: Produto não encontrado ou erro:', productError)
                        return NextResponse.json({ error: 'Product not found' }, { status: 400 })
                    }

                    console.log(`Webhook: Produto encontrado: ${product.id}. Criando assinatura...`)

                    // Inserir ou atualizar assinatura
                    const { error } = await supabase
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

                    if (error) {
                        console.error('Webhook: Erro ao salvar assinatura:', error)
                        return NextResponse.json({ error: 'Database error' }, { status: 500 })
                    }

                    console.log('Webhook: Assinatura ativada com sucesso!')
                } else {
                    console.error('Webhook: Metadados incompletos no pagamento')
                }
            }
        } catch (error) {
            console.error('Webhook: Erro ao processar pagamento:', error)
            return NextResponse.json({ error: 'Internal error' }, { status: 500 })
        }
    }

    return NextResponse.json({ received: true }, { status: 200 })
}

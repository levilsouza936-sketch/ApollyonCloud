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
        const paymentClient = new Payment(client)

        try {
            const payment = await paymentClient.get({ id: paymentId })

            if (payment.status === 'approved') {
                const userId = payment.metadata.user_id
                const plan = payment.metadata.plan
                const cycle = payment.metadata.cycle

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
                    const { data: product } = await supabase
                        .from('products')
                        .select('id')
                        .ilike('name', `%${plan}%`) // Busca aproximada (Standard ou Elite)
                        .single()

                    if (product) {
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
                            console.error('Erro ao salvar assinatura:', error)
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao processar pagamento:', error)
            return NextResponse.json({ error: 'Internal error' }, { status: 500 })
        }
    }

    return NextResponse.json({ received: true }, { status: 200 })
}

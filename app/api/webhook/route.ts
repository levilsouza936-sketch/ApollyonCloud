import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@/utils/supabase/server'

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
    options: { timeout: 5000 }
})

// Array para armazenar últimas requisições (em memória, só para debug)
const lastWebhookCalls: any[] = []

export async function GET() {
    return NextResponse.json({
        lastCalls: lastWebhookCalls.slice(-5),
        timestamp: new Date().toISOString()
    })
}

export async function POST(request: Request) {
    const startTime = Date.now()

    try {
        const body = await request.json()
        const headersList = headers()

        const debugInfo: any = {
            timestamp: new Date().toISOString(),
            body: body,
            headers: {
                'x-signature': headersList.get('x-signature'),
                'x-request-id': headersList.get('x-request-id'),
            },
            steps: []
        }

        // Salvar para debug
        lastWebhookCalls.push(debugInfo)
        if (lastWebhookCalls.length > 10) lastWebhookCalls.shift()

        debugInfo.steps.push('Webhook recebido')
        console.log('=== WEBHOOK RECEBIDO ===')
        console.log('Body:', JSON.stringify(body, null, 2))

        // Verificar se é evento de pagamento
        if (body.type !== 'payment') {
            debugInfo.steps.push(`Evento ignorado: ${body.type}`)
            console.log(`Evento ignorado (não é pagamento): ${body.type}`)
            return NextResponse.json({ received: true, debug: debugInfo }, { status: 200 })
        }

        const paymentId = body.data?.id
        if (!paymentId) {
            debugInfo.steps.push('Erro: ID de pagamento ausente')
            debugInfo.error = 'Payment ID missing'
            console.error('ID de pagamento ausente no body')
            return NextResponse.json({ received: true, debug: debugInfo }, { status: 200 })
        }

        debugInfo.paymentId = paymentId
        debugInfo.steps.push(`Processando pagamento ${paymentId}`)
        console.log(`Processando pagamento ${paymentId}`)

        // Buscar informações do pagamento no Mercado Pago
        const paymentClient = new Payment(client)
        let payment

        try {
            payment = await paymentClient.get({ id: paymentId })
            debugInfo.steps.push(`Pagamento encontrado: ${payment.status}`)
            debugInfo.paymentStatus = payment.status
            debugInfo.paymentMetadata = payment.metadata
            console.log(`Status do pagamento: ${payment.status}`)
            console.log(`Metadados:`, JSON.stringify(payment.metadata, null, 2))
        } catch (error: any) {
            debugInfo.steps.push('Erro ao buscar pagamento na API do MP')
            debugInfo.error = error.message
            console.error(`Erro ao buscar pagamento ${paymentId}:`, error)
            return NextResponse.json({ received: true, debug: debugInfo }, { status: 200 })
        }

        // Processar apenas pagamentos aprovados
        if (payment.status !== 'approved') {
            debugInfo.steps.push(`Pagamento não aprovado (status: ${payment.status})`)
            console.log(`Pagamento ${paymentId} não está aprovado`)
            return NextResponse.json({ received: true, debug: debugInfo }, { status: 200 })
        }

        // Extrair metadados
        const userId = payment.metadata?.user_id
        const plan = payment.metadata?.plan
        const cycle = payment.metadata?.cycle

        debugInfo.extractedMetadata = { userId, plan, cycle }
        debugInfo.steps.push('Metadados extraídos')
        console.log('Metadados extraídos:', { userId, plan, cycle })

        if (!userId || !plan || !cycle) {
            debugInfo.steps.push('Erro: Metadados incompletos')
            debugInfo.error = 'Missing metadata fields'
            console.error('Metadados incompletos')
            return NextResponse.json({ received: true, debug: debugInfo }, { status: 200 })
        }

        // Conectar ao Supabase
        const supabase = await createClient()
        debugInfo.steps.push('Conectado ao Supabase')

        // Calcular data de expiração
        const expiresAt = new Date()
        if (cycle === 'weekly') {
            expiresAt.setDate(expiresAt.getDate() + 7)
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1)
        }
        debugInfo.expiresAt = expiresAt.toISOString()
        debugInfo.steps.push(`Data de expiração calculada: ${expiresAt.toISOString()}`)

        // Buscar produto
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id')
            .ilike('name', `%${plan}%`)
            .single()

        if (productError || !product) {
            debugInfo.steps.push('Erro: Produto não encontrado')
            debugInfo.productError = productError
            console.error('Produto não encontrado:', productError)
            return NextResponse.json({ received: true, debug: debugInfo }, { status: 200 })
        }

        debugInfo.productId = product.id
        debugInfo.steps.push(`Produto encontrado: ${product.id}`)
        console.log(`Produto ${plan} encontrado (ID: ${product.id})`)

        // Criar assinatura
        const { error: insertError, data: insertData } = await supabase
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
            .select()

        if (insertError) {
            debugInfo.steps.push('Erro ao criar assinatura no DB')
            debugInfo.insertError = insertError
            console.error('Erro ao criar assinatura:', insertError)
            return NextResponse.json({ received: true, debug: debugInfo }, { status: 200 })
        }

        debugInfo.steps.push('✅ Assinatura criada com sucesso!')
        debugInfo.subscriptionData = insertData
        debugInfo.processingTime = Date.now() - startTime
        console.log('✅ Assinatura criada com sucesso!')
        console.log('Tempo de processamento:', debugInfo.processingTime, 'ms')

        return NextResponse.json({ received: true, status: 'subscription_created', debug: debugInfo }, { status: 200 })

    } catch (error: any) {
        console.error('Erro crítico no webhook:', error)
        const errorInfo = {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack
        }
        lastWebhookCalls.push(errorInfo)
        return NextResponse.json({ received: true, error: 'Internal error', debug: errorInfo }, { status: 200 })
    }
}

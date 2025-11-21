import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@/utils/supabase/server'

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
    options: { timeout: 5000 }
})

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('id')

    if (!paymentId) {
        return NextResponse.json({ error: 'Payment ID required. Use: /api/process-payment?id=PAYMENT_ID' }, { status: 400 })
    }

    console.log(`MANUAL: Processando pagamento ${paymentId}...`)

    try {
        const paymentClient = new Payment(client)
        const payment = await paymentClient.get({ id: paymentId })

        console.log(`MANUAL: Status: ${payment.status}`)
        console.log(`MANUAL: Metadata:`, payment.metadata)
        console.log(`MANUAL: External Reference:`, payment.external_reference)

        if (payment.status !== 'approved') {
            return NextResponse.json({
                error: 'Payment not approved',
                status: payment.status,
                payment
            }, { status: 400 })
        }

        const userId = payment.metadata?.user_id || payment.external_reference
        const plan = payment.metadata?.plan
        const cycle = payment.metadata?.cycle

        if (!userId || !plan || !cycle) {
            return NextResponse.json({
                error: 'Missing metadata',
                userId, plan, cycle,
                fullMetadata: payment.metadata
            }, { status: 400 })
        }

        const supabase = await createClient()

        const expiresAt = new Date()
        if (cycle === 'weekly') {
            expiresAt.setDate(expiresAt.getDate() + 7)
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1)
        }

        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, name')
            .ilike('name', `%${plan}%`)
            .single()

        if (productError || !product) {
            return NextResponse.json({
                error: 'Product not found',
                plan,
                productError
            }, { status: 400 })
        }

        const { data: subscription, error: insertError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                status: 'active',
                product_id: product.id,
                expires_at: expiresAt.toISOString(),
                metadata: {
                    payment_id: paymentId,
                    cycle: cycle,
                    amount: payment.transaction_amount,
                    payment_method: payment.payment_method_id
                }
            })
            .select()

        if (insertError) {
            return NextResponse.json({
                error: 'Failed to create subscription',
                insertError
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            subscription: subscription[0]
        })

    } catch (error: any) {
        return NextResponse.json({
            error: 'Internal error',
            message: error?.message
        }, { status: 500 })
    }
}

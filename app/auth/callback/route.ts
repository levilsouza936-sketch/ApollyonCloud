import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = createClient()
        console.log('Auth Callback: Trocando código por sessão...', { code })

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'

            // Determinar a URL base correta
            let baseUrl = origin
            if (process.env.NEXT_PUBLIC_SITE_URL) {
                baseUrl = process.env.NEXT_PUBLIC_SITE_URL
            } else if (forwardedHost && !isLocalEnv) {
                baseUrl = `https://${forwardedHost}`
            }

            console.log('Auth Callback: Sucesso! Redirecionando para', `${baseUrl}${next}`)
            return NextResponse.redirect(`${baseUrl}${next}`)
        } else {
            console.error('Auth Callback: Erro ao trocar código:', error)
            // Redirecionar para erro com detalhes
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
        }
    } else {
        console.error('Auth Callback: Nenhum código recebido na URL')
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

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
            console.log('Auth Callback: Sucesso! Redirecionando para', next)
            return NextResponse.redirect(`${origin}${next}`)
        } else {
            console.error('Auth Callback: Erro ao trocar código:', error)
        }
    } else {
        console.error('Auth Callback: Nenhum código recebido na URL')
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

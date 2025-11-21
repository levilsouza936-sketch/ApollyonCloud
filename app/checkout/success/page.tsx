import Link from 'next/link'
import { CheckCircle, ExternalLink, MessageSquare } from 'lucide-react'

export default function CheckoutSuccess() {
    return (
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-green-500/30 rounded-2xl p-8 shadow-2xl shadow-green-500/10 text-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>

                <h1 className="text-2xl font-bold mb-2 text-white">Pagamento Confirmado!</h1>
                <p className="text-slate-400 mb-8">
                    Sua assinatura foi ativada com sucesso. Agora só falta um passo para você acessar sua máquina.
                </p>

                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6 mb-8 text-left">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-violet-500" />
                        Próximos Passos:
                    </h3>
                    <ol className="list-decimal list-inside space-y-3 text-sm text-slate-300">
                        <li>Entre no nosso servidor do Discord.</li>
                        <li>Abra um ticket no canal <span className="text-violet-400 font-mono">#suporte</span>.</li>
                        <li>Nossa equipe entregará seus dados de acesso em instantes.</li>
                    </ol>
                </div>

                <div className="space-y-3">
                    <a
                        href="https://discord.gg/4xQs23qkYA"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        <ExternalLink className="w-5 h-5" />
                        Entrar no Discord
                    </a>

                    <Link
                        href="/dashboard"
                        className="block w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
                    >
                        Ir para meu Dashboard
                    </Link>
                </div>
            </div>
        </main>
    )
}

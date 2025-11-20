import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function AuthCodeError() {
    return (
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold mb-4">Erro na Autenticação</h1>

                <p className="text-slate-400 mb-8">
                    Não foi possível validar seu login com o Discord. Isso pode acontecer se o link expirou ou se houve uma falha na comunicação.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/"
                        className="block w-full py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all"
                    >
                        Tentar Novamente
                    </Link>

                    <Link
                        href="/"
                        className="block w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all"
                    >
                        Voltar ao Início
                    </Link>
                </div>
            </div>
        </main>
    )
}

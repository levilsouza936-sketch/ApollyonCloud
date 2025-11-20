import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-300 selection:bg-violet-500/30 py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar para o início
                </Link>

                <h1 className="text-4xl font-bold text-white mb-10">Termos de Uso</h1>

                <div className="space-y-12 text-lg leading-relaxed">
                    <section>
                        <p className="mb-6">
                            Ao acessar e utilizar os serviços da <strong>Apollyon Cloud</strong>, você declara que leu, compreendeu e concorda integralmente com estes Termos de Serviço. O uso de nossa infraestrutura implica aceitação automática das regras abaixo.
                        </p>
                    </section>

                    <section className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Licença de Uso</h2>
                        <p>
                            Ao contratar um plano semanal ou mensal, você recebe acesso exclusivo à máquina virtual. O acesso é <strong>individual e intransferível</strong>. É estritamente proibido compartilhar sua máquina com terceiros. Toda forma de revenda, empréstimo ou disponibilização do acesso não autorizada resultará em cancelamento.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Uso Proibido</h2>
                        <p className="mb-4">É expressamente proibido utilizar a infraestrutura da Apollyon Cloud para:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>Atividades ilegais (ataques cibernéticos, invasões, phishing, fraudes, spam, etc).</li>
                            <li>Instalação de malwares, miners de criptomoedas, bots, keyloggers ou software malicioso.</li>
                            <li>Alteração de configurações críticas do sistema ou tentativas de violação da segurança da nuvem.</li>
                            <li>Práticas que causem instabilidade, sobrecarga ou danos intencionais ao servidor.</li>
                        </ul>
                        <p className="mt-4 text-red-400 text-sm">
                            Qualquer violação resultará em suspensão imediata do serviço sem direito a reembolso.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Pagamentos e Reembolsos</h2>
                        <p>
                            Todas as transações são finais. Devido à natureza do produto digital (acesso imediato à infraestrutura), não oferecemos reembolso após o recebimento do acesso. O cliente é responsável por verificar os requisitos técnicos antes da contratação.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Suporte e Funcionamento</h2>
                        <p>
                            Nosso suporte cobre apenas instalações oficiais e não modificadas. Não oferecemos garantia de funcionamento caso o cliente altere arquivos de sistema ou danifique a configuração original. A estabilidade do serviço depende do uso adequado por parte do usuário.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Responsabilidade do Usuário</h2>
                        <p>
                            O usuário é integralmente responsável por todo o conteúdo e software executado dentro de sua instância virtual. A Apollyon Cloud não se responsabiliza por programas de terceiros. É proibido divulgar ou expor credenciais de acesso fornecidas pela plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Suspensão e Penalidades</h2>
                        <p>
                            A Apollyon Cloud reserva-se o direito de revogar acessos, suspender contas e encerrar serviços unilateralmente e sem aviso prévio em caso de violação destes termos.
                        </p>
                    </section>

                    <div className="pt-10 border-t border-slate-800">
                        <p className="text-sm text-slate-500">
                            Última atualização: Novembro de 2025.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}

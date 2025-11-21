import { createAdminClient } from '@/utils/supabase/admin'
import UserSubscriptionManager from './user-subscription-manager'

export default async function UsersPage() {
    const supabase = createAdminClient()

    // Buscar todos os usuários com suas assinaturas e produtos
    const { data: users } = await supabase
        .from('profiles')
        .select(`
            id,
            email,
            full_name,
            created_at,
            subscriptions (
                id,
                status,
                expires_at,
                created_at,
                product:products (
                    id,
                    name
                )
            )
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold">Gerenciar Usuários</h2>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-slate-400 border-b border-slate-800">
                                <th className="pb-3">Email</th>
                                <th className="pb-3">Nome</th>
                                <th className="pb-3">Plano Atual</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Vencimento</th>
                                <th className="pb-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map((user) => {
                                const activeSubscription = user.subscriptions?.find(
                                    (sub: any) => sub.status === 'active'
                                )

                                // Type cast para acessar o produto corretamente
                                const product = activeSubscription?.product as any

                                return (
                                    <tr key={user.id} className="border-b border-slate-800/50">
                                        <td className="py-4">{user.email}</td>
                                        <td className="py-4">{user.full_name || '-'}</td>
                                        <td className="py-4">
                                            {product?.name || 'Sem plano'}
                                        </td>
                                        <td className="py-4">
                                            {activeSubscription ? (
                                                <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-slate-700 text-slate-400 rounded text-xs">
                                                    Inativo
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 text-slate-400">
                                            {activeSubscription?.expires_at
                                                ? new Date(activeSubscription.expires_at).toLocaleDateString('pt-BR')
                                                : '-'}
                                        </td>
                                        <td className="py-4">
                                            {activeSubscription && (
                                                <UserSubscriptionManager
                                                    subscriptionId={activeSubscription.id}
                                                    currentStatus={activeSubscription.status}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {(!users || users.length === 0) && (
                    <p className="text-slate-400 text-center py-8">Nenhum usuário encontrado.</p>
                )}
            </div>
        </div>
    )
}

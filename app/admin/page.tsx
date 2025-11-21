import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Buscar estatísticas
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')

    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id')

    // Calcular total de vendas
    const totalSales = orders?.reduce((sum, order) => sum + (Number(order.amount) || 0), 0) || 0

    const stats = [
        {
            title: 'Vendas Totais',
            value: `R$ ${totalSales.toFixed(2)}`,
            icon: DollarSign,
            color: 'text-green-400'
        },
        {
            title: 'Assinaturas Ativas',
            value: subscriptions?.length || 0,
            icon: TrendingUp,
            color: 'text-blue-400'
        },
        {
            title: 'Total de Usuários',
            value: profiles?.length || 0,
            icon: Users,
            color: 'text-purple-400'
        },
        {
            title: 'Pedidos Totais',
            value: orders?.length || 0,
            icon: ShoppingCart,
            color: 'text-orange-400'
        }
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <div className="flex gap-4">
                    <Link
                        href="/admin/products"
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
                    >
                        Gerenciar Produtos
                    </Link>
                    <Link
                        href="/admin/coupons"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                    >
                        Gerenciar Cupons
                    </Link>
                    <Link
                        href="/admin/users"
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                    >
                        Gerenciar Usuários
                    </Link>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.title} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">{stat.title}</span>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Vendas Recentes */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Vendas Recentes</h3>
                {orders && orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-slate-400 border-b border-slate-800">
                                    <th className="pb-3">ID do Pedido</th>
                                    <th className="pb-3">Valor</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b border-slate-800/50">
                                        <td className="py-3 font-mono text-sm">{order.id.substring(0, 8)}...</td>
                                        <td className="py-3">R$ {(Number(order.amount) || 0).toFixed(2)}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded text-xs ${order.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                                    order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                        'bg-red-500/10 text-red-400'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-slate-400">
                                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-slate-400 text-center py-8">Nenhuma venda registrada ainda.</p>
                )}
            </div>
        </div>
    )
}

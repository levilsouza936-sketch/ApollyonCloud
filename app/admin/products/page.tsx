import { createClient } from '@/utils/supabase/server'
import ProductEditForm from './product-edit-form'

export default async function ProductsPage() {
    const supabase = await createClient()

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('name')

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold">Gerenciar Produtos</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {products?.map((product) => (
                    <ProductEditForm key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

import { createAdminClient } from '@/utils/supabase/admin'
import CouponForm from './coupon-form'
import CouponList from './coupon-list'

export default async function CouponsPage() {
    const supabase = createAdminClient()

    const { data: coupons } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold">Gerenciar Cupons</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <CouponForm />
                </div>
                <div className="lg:col-span-2">
                    <CouponList coupons={coupons || []} />
                </div>
            </div>
        </div>
    )
}

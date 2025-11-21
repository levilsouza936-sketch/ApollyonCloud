import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: products, error } = await supabase.from('products').select('*')

    return NextResponse.json({ products, error })
}

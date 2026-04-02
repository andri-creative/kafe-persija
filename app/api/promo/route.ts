import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        
        const promos = await prisma.promo.findMany({
            where: {
                OR: [
                    { status: { contains: status || 'active' } },
                    { status: 'Active' },
                    { status: 'ACTIVE' }
                ]
            },
            include: {
                promo_products_trx: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        console.log(`Found ${promos.length} promos in database.`);
        return NextResponse.json(promos);
    } catch (error) {
        console.error("Fetch Promo Error:", error);
        return NextResponse.json({ error: "Failed to fetch promos" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Anti-Error: Tangkap data dengan fleksibel (name/title, code/code_promo)
        const title = body.title || body.name;
        const code_promo = body.code_promo || body.code || body.code_promo_code;
        const type = body.type || 'fixed';
        const value = Number(body.value || 0);

        // Validasi: Pastikan data wajib ada
        if (!title || !code_promo) {
            return NextResponse.json({ 
                error: "Title dan Code Promo wajib diisi!" 
            }, { status: 400 });
        }

        // Cek Duplikat: Pastikan Kode Promo belum pernah dipakai
        const existing = await prisma.promo.findUnique({
            where: { code_promo }
        });

        if (existing) {
            return NextResponse.json({ 
                error: `Kode promo '${code_promo}' sudah terdaftar! Gunakan kode lain.` 
            }, { status: 400 });
        }

        const newPromo = await prisma.promo.create({
            data: {
                code_promo,
                type,
                value: value,
                title: title,
                desc: body.desc || body.description || "",
                min_order: body.min_order ? Number(body.min_order) : 0,
                max_usage: body.max_usage ? Number(body.max_usage) : 9999,
                usage_per_user: body.usage_per_user ? Number(body.usage_per_user) : 1,
                start_date: new Date(body.start_date || new Date()),
                end_date: new Date(body.end_date || new Date()),
                status: body.status || 'active',
                all_product: body.all_product || false,
                created_by: Number(body.created_by || 1),
                updated_by: Number(body.created_by || 1)
            }
        });

        return NextResponse.json(newPromo);
    } catch (error: any) {
        console.error("Create Promo Error Detail:", error);
        return NextResponse.json({ 
            error: "Gagal menyimpan promo ke database.",
            message: error.message 
        }, { status: 500 });
    }
}

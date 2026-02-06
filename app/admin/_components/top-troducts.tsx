import  prisma  from '@/lib/prisma'

export default async function TopProducts() {
  const topProducts = await prisma.transactionItem.groupBy({
    by: ['product_id'],
    _sum: { qty: true },
    orderBy: { _sum: { qty: 'desc' } },
    take: 10,
  })

  // Get product details
  const productIds = topProducts.map(item => item.product_id)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true }
  })

  const productMap = products.reduce((acc, product) => {
    acc[product.id] = product.name
    return acc
  }, {} as Record<number, string>)

  // Find max quantity for percentage calculation
  const maxQty = Math.max(...topProducts.map(item => item._sum.qty || 0))

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Produk Terlaris</h2>
      
      <div className="space-y-4">
        {topProducts.map((item) => {
          const productName = productMap[item.product_id] || 'Unknown Product'
          const qty = item._sum.qty || 0
          const percentage = maxQty > 0 ? (qty / maxQty) * 100 : 0

          return (
            <div key={item.product_id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium truncate">{productName}</span>
                <span className="text-gray-600">{qty} terjual</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
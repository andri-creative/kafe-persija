import  prisma  from '@/lib/prisma'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default async function RecentOrders() {
  const recentOrders = await prisma.transaction.findMany({
    take: 8,
    orderBy: { created_at: 'desc' },
    include: {
      user: {
        select: { nickname: true, email: true }
      }
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Pesanan Terbaru</h2>
        <a href="/admin/orders" className="text-blue-600 text-sm hover:underline">
          Lihat semua →
        </a>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 text-sm text-gray-600">ID</th>
              <th className="text-left py-3 text-sm text-gray-600">Customer</th>
              <th className="text-left py-3 text-sm text-gray-600">Tanggal</th>
              <th className="text-left py-3 text-sm text-gray-600">Total</th>
              <th className="text-left py-3 text-sm text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-3 text-sm">#{order.id.toString().padStart(4, '0')}</td>
                <td className="py-3">
                  <div>
                    <p className="font-medium">{order.user.nickname}</p>
                    <p className="text-xs text-gray-500">{order.user.email}</p>
                  </div>
                </td>
                <td className="py-3 text-sm">
                  {format(new Date(order.created_at), 'dd MMM yyyy', { locale: id })}
                </td>
                <td className="py-3 font-medium">
                  Rp {Number(order.total).toLocaleString('id-ID')}
                </td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {order.status === 'completed' ? 'Selesai' : 
                     order.status === 'pending' ? 'Pending' : 'Dibatalkan'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
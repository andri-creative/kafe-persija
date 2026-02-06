import { getDashboardData } from '@/lib/dashboard'

export default async function DashboardStats() {
  const data = await getDashboardData()
  
  const stats = [
    {
      title: 'Total Pendapatan',
      value: `Rp ${data.totalRevenue.toLocaleString('id-ID')}`,
      icon: '💰',
      change: '+12.5%',
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Total Pesanan',
      value: data.totalOrders.toString(),
      icon: '📦',
      change: '+8.2%',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Total Pengguna',
      value: data.totalUsers.toString(),
      icon: '👥',
      change: '+5.7%',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Total Produk',
      value: data.totalProducts.toString(),
      icon: '🍔',
      change: '+3.4%',
      color: 'bg-yellow-100 text-yellow-800'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
              <p className="text-xs text-green-600 mt-1">{stat.change} dari bulan lalu</p>
            </div>
            <div className={`p-3 rounded-full ${stat.color} text-2xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
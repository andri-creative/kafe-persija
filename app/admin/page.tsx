import { Suspense } from 'react'
import DashboardStats from './_components/dashboard-stats'
import RecentOrders from './_components/recent-orders'
import TopProducts from './_components/top-troducts'

export default async function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>
      
      {/* Stats Cards */}
      <Suspense fallback={<StatsLoading />}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Orders */}
        <Suspense fallback={<OrdersLoading />}>
          <RecentOrders />
        </Suspense>

        {/* Top Products */}
        <Suspense fallback={<ProductsLoading />}>
          <TopProducts />
        </Suspense>
      </div>
    </div>
  )
}

// Loading components
function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-32 rounded-lg animate-pulse"></div>
      ))}
    </div>
  )
}

function OrdersLoading() {
  return (
    <div className="bg-gray-200 h-96 rounded-lg animate-pulse"></div>
  )
}

function ProductsLoading() {
  return (
    <div className="bg-gray-200 h-96 rounded-lg animate-pulse"></div>
  )
}
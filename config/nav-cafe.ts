export const navCafe = {
  superAdmin: [
    {
      title: "Super Admin Panel",
      group: "super-admin",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
        { title: "Settings", url: "/super-admin/settings", icon: "Settings" },
        { title: "Audit Logs", url: "/super-admin/audit-logs", icon: "History" },
        { title: "Admin Manage", url: "/super-admin/admin-manage", icon: "UserCog" },
      ],
    },

  ],
  admin: [
    {
      title: "Admin Panel",
      group: "admin",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
        { title: "Product", url: "/admin/product", icon: "Package" },
        { title: "Category", url: "/admin/product/category", icon: "FolderTree" },
        { title: "Discount", url: "/admin/discount", icon: "Percent" },
        { title: "Promo", url: "/admin/promo", icon: "Ticket" },
        { title: "Accounts", url: "/admin/accounts", icon: "Users" },
        { title: "Order List", url: "/admin/order", icon: "ClipboardList" },
        { title: "TV Display", url: "/admin/layar-tv", icon: "Tv" },
      ],
    },
  ],
  manager: [
    {
      title: "Manager Panel",
      group: "manager",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
        { title: "Sales Reports", url: "/manager/sales-reports", icon: "BarChart3" },
        { title: "Inventory", url: "/manager/inventory", icon: "Archive" },
        { title: "Product List", url: "/admin/product", icon: "Package" },
      ],
    },
  ],
  staff: [
    {
      title: "POS / Kasir",
      group: "staff",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
        { title: "Menu / POS", url: "/staff/menu", icon: "ShoppingCart" },
        { title: "Order List", url: "/admin/order", icon: "ClipboardList" },
        { title: "TV Display", url: "/admin/layar-tv", icon: "Tv" },
      ],
    },
  ],
};

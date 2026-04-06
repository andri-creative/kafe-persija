// export const navCafe = {
//   superAdmin: [
//     {
//       title: "Super Admin Panel",
//       group: "super-admin",
//       items: [
//         { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
//         { title: "Settings", url: "/super-admin/settings", icon: "Settings" },
//         { title: "Audit Logs", url: "/super-admin/audit-logs", icon: "History" },
//         { title: "Admin Manage", url: "/super-admin/admin-manage", icon: "UserCog" },
//         { title: "Roles", url: "/super-admin/roles", icon: "ShieldCheck" },
//         { title: "Permissions", url: "/super-admin/permissions", icon: "Key" },
//       ],
//     },

//   ],
//   admin: [
//     {
//       title: "Admin Panel",
//       group: "admin",
//       items: [
//         { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
//         { title: "Product", url: "/admin/product", icon: "Package" },
//         { title: "Category", url: "/admin/product/category", icon: "FolderTree" },
//         { title: "Discount", url: "/admin/discount", icon: "Percent" },
//         { title: "Promo", url: "/admin/promo", icon: "Ticket" },
//         { title: "Accounts", url: "/admin/accounts", icon: "Users" },
//         { title: "Order List", url: "/admin/order", icon: "ClipboardList" },
//         { title: "TV Display", url: "/admin/layar-tv", icon: "Tv" },
//       ],
//     },
//   ],
//   manager: [
//     {
//       title: "Manager Panel",
//       group: "manager",
//       items: [
//         { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
//         { title: "Sales Reports", url: "/manager/sales-reports", icon: "BarChart3" },
//         { title: "Inventory", url: "/manager/inventory", icon: "Archive" },
//         { title: "Product List", url: "/admin/product", icon: "Package" },
//       ],
//     },
//   ],
//   staff: [
//     {
//       title: "POS / Kasir",
//       group: "staff",
//       items: [
//         { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
//         { title: "Menu / POS", url: "/staff/menu", icon: "ShoppingCart" },
//         { title: "Order List", url: "/admin/order", icon: "ClipboardList" },
//         { title: "TV Display", url: "/admin/layar-tv", icon: "Tv" },
//       ],
//     },
//   ],
// };


export const navCafe = [
  {
    title: "Main Navigation",
    group: "main",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
      { title: "Menu / POS", url: "/menu", icon: "ShoppingCart", permission: "order_manage" },
      { title: "Product", url: "/product", icon: "Package", permission: "product_view" },
      { title: "Category", url: "/product/category", icon: "FolderTree", permission: "category_view" },
      { title: "Discount", url: "/discount", icon: "Percent", permission: "discount_view" },
      { title: "Promo", url: "/promo", icon: "Ticket", permission: "promo_view" },
      { title: "Order List", url: "/order", icon: "ClipboardList", permission: "order_view" },
      { title: "TV Display", url: "/layar-tv", icon: "Tv", permission: "order_view" },
      { title: "Sales Reports", url: "/sales-reports", icon: "BarChart3", permission: "report_view" },
      // { title: "Inventory", url: "/inventory", icon: "Archive", permission: "product_view" },
      { title: "Settings", url: "/settings", icon: "Settings", permission: "setting_view" },
      // { title: "Audit Logs", url: "/audit-logs", icon: "History", permission: "rbac_view" },
      // { title: "Admin Manage", url: "/admin-manage", icon: "UserCog", permission: "user_view" },
      { title: "Accounts", url: "/accounts", icon: "Users", permission: "user_view" },
    ],
  },
  {
    title: "RBAC Management",
    group: "rbac",
    icon: "Bot",
    items: [
      { title: "Assignments", url: "/assignments", icon: "UserCog", permission: "rbac_manage" },
      { title: "Roles", url: "/roles", icon: "ShieldCheck", permission: "roles_view" },
      { title: "Permissions", url: "/permissions", icon: "Key", permission: "permission_view" },
    ],
  }
];
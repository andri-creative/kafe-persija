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
      { title: "Menu / POS", url: "/menu", icon: "ShoppingCart" },
      { title: "Product", url: "/product", icon: "Package" },
      { title: "Category", url: "/product/category", icon: "FolderTree" },
      { title: "Discount", url: "/discount", icon: "Percent" },
      { title: "Promo", url: "/promo", icon: "Ticket" },
      { title: "Accounts", url: "/accounts", icon: "Users" },
      { title: "Order List", url: "/order", icon: "ClipboardList" },
      { title: "TV Display", url: "/layar-tv", icon: "Tv" },
      { title: "Sales Reports", url: "/sales-reports", icon: "BarChart3" },
      { title: "Inventory", url: "/inventory", icon: "Archive" },
      { title: "Settings", url: "/settings", icon: "Settings" },
      { title: "Audit Logs", url: "/audit-logs", icon: "History" },
      { title: "Admin Manage", url: "/admin-manage", icon: "UserCog" },

    ],
  },
  {
    title: "RBAC Management",
    group: "rbac",
    icon: "Bot",
    items: [
      { title: "Assignments", url: "/assignments", icon: "UserCog" },
      { title: "Roles", url: "/roles", icon: "ShieldCheck" },
      { title: "Permissions", url: "/permissions", icon: "Key" },
    ],
  }
];

export const navCafe = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "LayoutDashboard",
    },
    {
      title: "Order",
      url: "/order",
      icon: "ShoppingCart",
    },
    {
      title: "Product",
      icon: "Package",
      url: "#",
      items: [
        {
          title: "Product",
          url: "/product",
        },
        {
          title: "Category",
          url: "/product/category",
        },
        {
          title: "Variant",
          url: "/product/variant",
        },
      ],
    },
    {
      title: "Report",
      url: "/report",
      icon: "BarChart3",
    },
  ],
};

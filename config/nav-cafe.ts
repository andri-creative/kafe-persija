import { title } from "process";

export const navCafe = {
  navMain: [
    {
      title: "Order",
      url: "/order",
      icon: "ShoppingCart",
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "LayoutDashboard",
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
      ],
    },
    {
      title: "Users",
      url: "/users",
      icon: "Users",
    },
    {
      title: "Profile",
      url: "/profile",
      icon: "User",
    },
    {
      title: "Report",
      url: "/report",
      icon: "BarChart3",
    },
  ],
};

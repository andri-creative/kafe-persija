"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"

const routeMap: Record<string, string> = {
    admin: "Admin",
    users: "Users",
    order: "Order Monitor",
    "order-baru": "Order Monitor",
    "order-lama": "History Order",
    product: "Product",
    categories: "Categories",
    profile: "Profile",
    dashboard: "Dashboard",
    "layar-tv": "Layar TV",
}

export function DynamicBreadcrumbs() {
    const pathname = usePathname()

    // Kecuali layar-tv
    if (pathname.includes("/admin/layar-tv")) {
        return null
    }

    const segments = pathname.split("/").filter(Boolean)

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/" className="flex items-center gap-1">
                        <Home className="size-3" />
                        Home
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {segments.map((segment, index) => {
                    const href = `/${segments.slice(0, index + 1).join("/")}`
                    const isLast = index === segments.length - 1
                    const label = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="capitalize font-bold text-blue-600">
                                        {label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href} className="hidden md:block capitalize">
                                        {label}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/current-user";
import { redirect } from "next/navigation";

// Set to true to bypass guard in development
const DEVELOPMENT_MODE = true;

export default async function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  // Bypass guard in development
  if (DEVELOPMENT_MODE) {
    return children;
  }

  // Production mode: check roles
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      redirect("/403");
    }

    const roles = await prisma.userRoleTrx.findMany({
      where: { user_id: userId },
      include: { role: true },
    });

    const allowed = roles.some((r) =>
      ["super_admin", "admin", "manager", "staff"].includes(r.role.name)
    );

    if (!allowed) {
      redirect("/403");
    }

    return children;
  } catch (error) {
    console.error("Error in AdminGuard:", error);
    redirect("/403");
  }
}

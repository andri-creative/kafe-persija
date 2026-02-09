// lib/role-path.ts
export function getBasePathByRole(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "/super-admin";
    case "ADMIN":
      return "/admin";
    case "STAFF":
      return "/staff";
    default:
      return "/";
  }
}

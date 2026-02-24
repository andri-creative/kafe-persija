// lib/role-path.ts
export function getBasePathByRole(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
    case "MANAGER":
      return "";
    case "STAFF":
      return "/staff";
    default:
      return "/";
  }
}

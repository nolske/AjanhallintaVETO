export function canAccessAdminArea(role: "user" | "admin" | null | undefined) {
  return role === "admin";
}

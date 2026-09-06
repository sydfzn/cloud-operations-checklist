export type AppRole = "admin" | "lead" | "operator" | "customer_viewer";

export const APP_ROLES: AppRole[] = ["admin", "lead", "operator", "customer_viewer"];
export type Permission = "checklists.read" | "checklists.write" | "reviews.read" | "reviews.approve" | "reports.view" | "customers.manage";

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  admin: ["checklists.read", "checklists.write", "reviews.read", "reviews.approve", "reports.view", "customers.manage"],
  lead: ["checklists.read", "checklists.write", "reviews.read", "reviews.approve", "reports.view"],
  operator: ["checklists.read", "checklists.write", "reviews.read", "reports.view"],
  customer_viewer: ["checklists.read", "reviews.read", "reports.view"],
};

export function hasPermission(role: AppRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAccessRole(role: AppRole, allowed: AppRole[]): boolean {
  return allowed.includes(role);
}

export function canManageCustomers(role: AppRole): boolean {
  return role === "admin";
}

export function canApproveReviews(role: AppRole): boolean {
  return role === "admin" || role === "lead";
}

export function canOperateChecklists(role: AppRole): boolean {
  return role === "admin" || role === "lead" || role === "operator";
}

export function canViewCustomerReports(role: AppRole): boolean {
  return APP_ROLES.includes(role);
}

export function normalizeAppRole(role: "user" | "admin" | AppRole): AppRole {
  if (role === "admin") return "admin";
  if (role === "lead") return "lead";
  if (role === "customer_viewer") return "customer_viewer";
  return "operator";
}

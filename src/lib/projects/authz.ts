import type { ProjectMemberRole } from "@/types/domain";

export function canManageProject(role: ProjectMemberRole | null | undefined) {
  return role === "owner";
}

export function canRemoveProjectMember(
  currentUserRole: ProjectMemberRole | null | undefined,
  targetRole: ProjectMemberRole | null | undefined
) {
  return currentUserRole === "owner" && targetRole === "member";
}

export function canViewProjectTotal(role: ProjectMemberRole | null | undefined) {
  return role === "owner";
}

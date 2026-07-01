export type UserRole = "user" | "admin";

export type ProjectMemberRole = "owner" | "member";

export type TimeEntryDraft = {
  projectId: string;
  entryDate: string;
  minutes: number;
  description?: string;
};

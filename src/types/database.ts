export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          role: "user" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          owner_id: string;
          status: "active" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          owner_id: string;
          status?: "active" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          owner_id?: string;
          status?: "active" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      project_members: {
        Row: {
          project_id: string;
          user_id: string;
          role: "owner" | "member";
          joined_at: string;
        };
        Insert: {
          project_id: string;
          user_id: string;
          role?: "owner" | "member";
          joined_at?: string;
        };
        Update: {
          project_id?: string;
          user_id?: string;
          role?: "owner" | "member";
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      time_entries: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          entry_date: string;
          duration_minutes: number;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id?: string;
          entry_date: string;
          duration_minutes: number;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          entry_date?: string;
          duration_minutes?: number;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "time_entries_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "time_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      is_project_active: {
        Args: { p_project_id: string };
        Returns: boolean;
      };
      is_project_member: {
        Args: { p_project_id: string; p_user_id: string };
        Returns: boolean;
      };
      is_project_owner: {
        Args: { p_project_id: string; p_user_id: string };
        Returns: boolean;
      };
      ensure_current_profile: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_my_project_summaries: {
        Args: Record<PropertyKey, never>;
        Returns: {
          project_id: string;
          name: string;
          description: string | null;
          owner_id: string;
          owner_email: string;
          owner_display_name: string | null;
          status: "active" | "archived";
          user_role: "owner" | "member";
          member_count: number;
          current_user_minutes: number;
          total_minutes: number | null;
        }[];
      };
      get_project_detail: {
        Args: { p_project_id: string };
        Returns: {
          project_id: string;
          name: string;
          description: string | null;
          owner_id: string;
          owner_email: string;
          owner_display_name: string | null;
          status: "active" | "archived";
          user_role: "owner" | "member";
          member_count: number;
          current_user_minutes: number;
          total_minutes: number | null;
        }[];
      };
      get_project_members: {
        Args: { p_project_id: string };
        Returns: {
          user_id: string;
          email: string;
          display_name: string | null;
          role: "owner" | "member";
          joined_at: string;
        }[];
      };
      add_project_member_by_email: {
        Args: { p_project_id: string; p_email: string };
        Returns: "added" | "already_member" | "not_allowed" | "not_found";
      };
      remove_project_member: {
        Args: { p_project_id: string; p_user_id: string };
        Returns: "not_allowed" | "not_found" | "owner_not_removed" | "removed";
      };
      get_time_entry_projects: {
        Args: Record<PropertyKey, never>;
        Returns: {
          project_id: string;
          name: string;
          status: "active" | "archived";
          user_role: "owner" | "member";
        }[];
      };
      get_my_time_entries: {
        Args: { p_project_id?: string | null };
        Returns: {
          entry_id: string;
          project_id: string;
          project_name: string;
          project_status: "active" | "archived";
          user_id: string;
          entry_date: string;
          duration_minutes: number;
          description: string | null;
          created_at: string;
          updated_at: string;
        }[];
      };
      get_project_time_entries: {
        Args: { p_project_id: string };
        Returns: {
          entry_id: string;
          project_id: string;
          project_name: string;
          project_status: "active" | "archived";
          user_id: string;
          user_email: string;
          user_display_name: string | null;
          entry_date: string;
          duration_minutes: number;
          description: string | null;
          created_at: string;
          updated_at: string;
        }[];
      };
      get_time_entry_for_edit: {
        Args: { p_entry_id: string };
        Returns: {
          entry_id: string;
          project_id: string;
          project_name: string;
          project_status: "active" | "archived";
          entry_date: string;
          duration_minutes: number;
          description: string | null;
          created_at: string;
          updated_at: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

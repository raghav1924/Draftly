export type SharePermission = "viewer" | "editor";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          content: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title?: string;
          content?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          content?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_shares: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          permission: SharePermission;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          user_id: string;
          permission?: SharePermission;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          user_id?: string;
          permission?: SharePermission;
          created_at?: string;
        };
      };
    };
    Enums: {
      share_permission: SharePermission;
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentShare =
  Database["public"]["Tables"]["document_shares"]["Row"];

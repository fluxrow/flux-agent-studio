export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bot_versions: {
        Row: {
          bot_id: string
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["bot_version_status"]
          version: number
          workspace_id: string
        }
        Insert: {
          bot_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          snapshot: Json
          status?: Database["public"]["Enums"]["bot_version_status"]
          version: number
          workspace_id: string
        }
        Update: {
          bot_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          snapshot?: Json
          status?: Database["public"]["Enums"]["bot_version_status"]
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_versions_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_versions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      bots: {
        Row: {
          channel: string
          conversations_count: number
          conversions_count: number
          created_at: string
          description: string
          id: string
          name: string
          published_version_id: string | null
          status: Database["public"]["Enums"]["bot_status"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          channel?: string
          conversations_count?: number
          conversions_count?: number
          created_at?: string
          description?: string
          id?: string
          name: string
          published_version_id?: string | null
          status?: Database["public"]["Enums"]["bot_status"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          channel?: string
          conversations_count?: number
          conversions_count?: number
          created_at?: string
          description?: string
          id?: string
          name?: string
          published_version_id?: string | null
          status?: Database["public"]["Enums"]["bot_status"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bots_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          account: string | null
          channel_key: string
          coming_soon: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["channel_status"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          account?: string | null
          channel_key: string
          coming_soon?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["channel_status"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          account?: string | null
          channel_key?: string
          coming_soon?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["channel_status"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          bot_id: string
          bot_name: string
          created_at: string
          id: string
          last_message_at: string
          lead_name: string
          preview: string
          session_id: string
          status: Database["public"]["Enums"]["session_status"]
          unread: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          bot_id: string
          bot_name: string
          created_at?: string
          id?: string
          last_message_at?: string
          lead_name?: string
          preview?: string
          session_id: string
          status?: Database["public"]["Enums"]["session_status"]
          unread?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          bot_id?: string
          bot_name?: string
          created_at?: string
          id?: string
          last_message_at?: string
          lead_name?: string
          preview?: string
          session_id?: string
          status?: Database["public"]["Enums"]["session_status"]
          unread?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          block_key: string | null
          bot_id: string | null
          created_at: string
          flow_id: string | null
          id: string
          occurred_at: string
          payload: Json
          session_id: string | null
          type: string
          workspace_id: string
        }
        Insert: {
          block_key?: string | null
          bot_id?: string | null
          created_at?: string
          flow_id?: string | null
          id?: string
          occurred_at?: string
          payload?: Json
          session_id?: string | null
          type: string
          workspace_id: string
        }
        Update: {
          block_key?: string | null
          bot_id?: string | null
          created_at?: string
          flow_id?: string | null
          id?: string
          occurred_at?: string
          payload?: Json
          session_id?: string | null
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_blocks: {
        Row: {
          block_key: string
          config: Json
          created_at: string
          flow_id: string
          id: string
          label: string | null
          position: Json
          type: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          block_key: string
          config?: Json
          created_at?: string
          flow_id: string
          id?: string
          label?: string | null
          position?: Json
          type: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          block_key?: string
          config?: Json
          created_at?: string
          flow_id?: string
          id?: string
          label?: string | null
          position?: Json
          type?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_blocks_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_blocks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_connections: {
        Row: {
          condition: string | null
          connection_key: string
          created_at: string
          flow_id: string
          from_block_key: string
          id: string
          to_block_key: string
          workspace_id: string
        }
        Insert: {
          condition?: string | null
          connection_key: string
          created_at?: string
          flow_id: string
          from_block_key: string
          id?: string
          to_block_key: string
          workspace_id: string
        }
        Update: {
          condition?: string | null
          connection_key?: string
          created_at?: string
          flow_id?: string
          from_block_key?: string
          id?: string
          to_block_key?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_connections_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      flows: {
        Row: {
          bot_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
          variables: Json
          workspace_id: string
        }
        Insert: {
          bot_id: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          variables?: Json
          workspace_id: string
        }
        Update: {
          bot_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          variables?: Json
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flows_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: true
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flows_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          bot_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          score: number
          source: string
          stage: Database["public"]["Enums"]["lead_stage"]
          tags: string[] | null
          temperature: Database["public"]["Enums"]["lead_temperature"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          bot_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          score?: number
          source?: string
          stage?: Database["public"]["Enums"]["lead_stage"]
          tags?: string[] | null
          temperature?: Database["public"]["Enums"]["lead_temperature"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          bot_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          score?: number
          source?: string
          stage?: Database["public"]["Enums"]["lead_stage"]
          tags?: string[] | null
          temperature?: Database["public"]["Enums"]["lead_temperature"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          block_key: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["message_role"]
          sent_at: string
          session_id: string
          text: string
          workspace_id: string
        }
        Insert: {
          block_key?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["message_role"]
          sent_at?: string
          session_id: string
          text: string
          workspace_id: string
        }
        Update: {
          block_key?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["message_role"]
          sent_at?: string
          session_id?: string
          text?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          bot_id: string
          channel: string
          created_at: string
          current_block_key: string | null
          ended_at: string | null
          id: string
          lead_id: string | null
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
          variables: Json
          visitor_id: string
          workspace_id: string
        }
        Insert: {
          bot_id: string
          channel?: string
          created_at?: string
          current_block_key?: string | null
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
          variables?: Json
          visitor_id: string
          workspace_id: string
        }
        Update: {
          bot_id?: string
          channel?: string
          created_at?: string
          current_block_key?: string | null
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
          variables?: Json
          visitor_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          plan: Database["public"]["Enums"]["workspace_plan"]
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          plan?: Database["public"]["Enums"]["workspace_plan"]
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          plan?: Database["public"]["Enums"]["workspace_plan"]
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_workspace_role: {
        Args: {
          _roles: Database["public"]["Enums"]["workspace_role"][]
          _user_id: string
          _workspace_id: string
        }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
    }
    Enums: {
      bot_status: "ativo" | "rascunho" | "arquivado"
      bot_version_status: "draft" | "published" | "archived"
      channel_status: "connected" | "disconnected" | "em_breve"
      lead_stage:
        | "novo"
        | "qualificado"
        | "negociacao"
        | "convertido"
        | "perdido"
      lead_temperature: "frio" | "morno" | "quente"
      message_role: "bot" | "user" | "agent" | "system"
      session_status: "ativa" | "encerrada" | "humano" | "expirada"
      workspace_plan: "free" | "starter" | "growth" | "scale"
      workspace_role: "owner" | "admin" | "editor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      bot_status: ["ativo", "rascunho", "arquivado"],
      bot_version_status: ["draft", "published", "archived"],
      channel_status: ["connected", "disconnected", "em_breve"],
      lead_stage: [
        "novo",
        "qualificado",
        "negociacao",
        "convertido",
        "perdido",
      ],
      lead_temperature: ["frio", "morno", "quente"],
      message_role: ["bot", "user", "agent", "system"],
      session_status: ["ativa", "encerrada", "humano", "expirada"],
      workspace_plan: ["free", "starter", "growth", "scale"],
      workspace_role: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const

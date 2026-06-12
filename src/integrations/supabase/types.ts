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
      ai_rate_limit_windows: {
        Row: {
          request_count: number
          user_id: string
          window_started_at: string
        }
        Insert: {
          request_count?: number
          user_id: string
          window_started_at?: string
        }
        Update: {
          request_count?: number
          user_id?: string
          window_started_at?: string
        }
        Relationships: []
      }
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
          published_at: string | null
          published_snapshot: Json | null
          published_version_id: string | null
          slug: string | null
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
          published_at?: string | null
          published_snapshot?: Json | null
          published_version_id?: string | null
          slug?: string | null
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
          published_at?: string | null
          published_snapshot?: Json | null
          published_version_id?: string | null
          slug?: string | null
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
      calendar_events: {
        Row: {
          attendees: Json
          calendar_id: string
          created_at: string
          description: string | null
          end_at: string
          etag: string | null
          external_event_id: string
          google_updated_at: string | null
          id: string
          lead_id: string | null
          meet_link: string | null
          sequence: number | null
          session_id: string | null
          start_at: string
          status: string
          summary: string
          timezone: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          attendees?: Json
          calendar_id?: string
          created_at?: string
          description?: string | null
          end_at: string
          etag?: string | null
          external_event_id: string
          google_updated_at?: string | null
          id?: string
          lead_id?: string | null
          meet_link?: string | null
          sequence?: number | null
          session_id?: string | null
          start_at: string
          status?: string
          summary?: string
          timezone?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          attendees?: Json
          calendar_id?: string
          created_at?: string
          description?: string | null
          end_at?: string
          etag?: string | null
          external_event_id?: string
          google_updated_at?: string | null
          id?: string
          lead_id?: string | null
          meet_link?: string | null
          sequence?: number | null
          session_id?: string | null
          start_at?: string
          status?: string
          summary?: string
          timezone?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_watch_channels: {
        Row: {
          calendar_id: string
          channel_id: string
          channel_token: string
          created_at: string
          expires_at: string
          id: string
          resource_id: string | null
          sync_token: string | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          calendar_id?: string
          channel_id: string
          channel_token: string
          created_at?: string
          expires_at: string
          id?: string
          resource_id?: string | null
          sync_token?: string | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          calendar_id?: string
          channel_id?: string
          channel_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          resource_id?: string | null
          sync_token?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_watch_channels_workspace_id_fkey"
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
          lead_id: string | null
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
          lead_id?: string | null
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
          lead_id?: string | null
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
      lead_attribution: {
        Row: {
          created_at: string
          fbclid: string | null
          gclid: string | null
          id: string
          landing_page: string | null
          lead_id: string | null
          msclkid: string | null
          referrer: string | null
          session_id: string | null
          ttclid: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          fbclid?: string | null
          gclid?: string | null
          id?: string
          landing_page?: string | null
          lead_id?: string | null
          msclkid?: string | null
          referrer?: string | null
          session_id?: string | null
          ttclid?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          fbclid?: string | null
          gclid?: string | null
          id?: string
          landing_page?: string | null
          lead_id?: string | null
          msclkid?: string | null
          referrer?: string | null
          session_id?: string | null
          ttclid?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string
          workspace_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          bot_id: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          last_activity_at: string
          name: string
          notes: string | null
          owner_id: string | null
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
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_activity_at?: string
          name: string
          notes?: string | null
          owner_id?: string | null
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
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_activity_at?: string
          name?: string
          notes?: string | null
          owner_id?: string | null
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
      meta_channel_connections: {
        Row: {
          access_token: string
          created_at: string
          display_name: string
          error_message: string | null
          id: string
          ig_user_id: string | null
          meta: Json
          page_id: string | null
          phone_number_id: string | null
          platform: string
          status: string
          updated_at: string
          webhook_verified: boolean
          workspace_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          display_name?: string
          error_message?: string | null
          id?: string
          ig_user_id?: string | null
          meta?: Json
          page_id?: string | null
          phone_number_id?: string | null
          platform: string
          status?: string
          updated_at?: string
          webhook_verified?: boolean
          workspace_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          display_name?: string
          error_message?: string | null
          id?: string
          ig_user_id?: string | null
          meta?: Json
          page_id?: string | null
          phone_number_id?: string | null
          platform?: string
          status?: string
          updated_at?: string
          webhook_verified?: boolean
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_channel_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_conversations: {
        Row: {
          connection_id: string
          contact_avatar: string | null
          contact_external_id: string
          contact_name: string
          created_at: string
          external_conversation_id: string
          handoff_status: string
          id: string
          last_message_at: string
          platform: string
          preview: string
          unread: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          connection_id: string
          contact_avatar?: string | null
          contact_external_id: string
          contact_name?: string
          created_at?: string
          external_conversation_id: string
          handoff_status?: string
          id?: string
          last_message_at?: string
          platform: string
          preview?: string
          unread?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          connection_id?: string
          contact_avatar?: string | null
          contact_external_id?: string
          contact_name?: string
          created_at?: string
          external_conversation_id?: string
          handoff_status?: string
          id?: string
          last_message_at?: string
          platform?: string
          preview?: string
          unread?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_conversations_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "meta_channel_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_conversations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_messages: {
        Row: {
          contact_external_id: string
          conversation_id: string
          created_at: string
          direction: string
          external_message_id: string
          id: string
          message_text: string | null
          message_type: string
          raw_payload: Json | null
          sent_at: string
          workspace_id: string
        }
        Insert: {
          contact_external_id: string
          conversation_id: string
          created_at?: string
          direction: string
          external_message_id: string
          id?: string
          message_text?: string | null
          message_type?: string
          raw_payload?: Json | null
          sent_at: string
          workspace_id: string
        }
        Update: {
          contact_external_id?: string
          conversation_id?: string
          created_at?: string
          direction?: string
          external_message_id?: string
          id?: string
          message_text?: string | null
          message_type?: string
          raw_payload?: Json | null
          sent_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "meta_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_state_nonces: {
        Row: {
          consumed_at: string | null
          created_at: string
          expires_at: string
          nonce: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          nonce: string
          user_id: string
          workspace_id: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          nonce?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_state_nonces_workspace_id_fkey"
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
      public_ai_bot_rate_limit_windows: {
        Row: {
          bot_id: string
          request_count: number
          window_started_at: string
        }
        Insert: {
          bot_id: string
          request_count?: number
          window_started_at?: string
        }
        Update: {
          bot_id?: string
          request_count?: number
          window_started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_ai_bot_rate_limit_windows_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: true
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      public_ai_session_tokens: {
        Row: {
          created_at: string
          expires_at: string
          request_count: number
          session_id: string
          token: string
          window_started_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          request_count?: number
          session_id: string
          token: string
          window_started_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          request_count?: number
          session_id?: string
          token?: string
          window_started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_ai_session_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      public_session_creation_rate_limit_windows: {
        Row: {
          bot_id: string
          request_count: number
          window_started_at: string
        }
        Insert: {
          bot_id: string
          request_count?: number
          window_started_at?: string
        }
        Update: {
          bot_id?: string
          request_count?: number
          window_started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_session_creation_rate_limit_windows_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: true
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      public_session_write_rate_limit_windows: {
        Row: {
          request_count: number
          session_id: string
          window_started_at: string
        }
        Insert: {
          request_count?: number
          session_id: string
          window_started_at?: string
        }
        Update: {
          request_count?: number
          session_id?: string
          window_started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_session_write_rate_limit_windows_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
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
      user_calendar_tokens: {
        Row: {
          access_token: string
          created_at: string
          default_calendar_id: string
          email: string
          expires_at: string
          google_sub: string
          id: string
          refresh_token: string
          scopes: string[]
          status: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          default_calendar_id?: string
          email: string
          expires_at: string
          google_sub: string
          id?: string
          refresh_token: string
          scopes?: string[]
          status?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          default_calendar_id?: string
          email?: string
          expires_at?: string
          google_sub?: string
          id?: string
          refresh_token?: string
          scopes?: string[]
          status?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_calendar_tokens_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_profiles: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          first_seen_at: string
          id: string
          landing_page: string | null
          language: string | null
          last_seen_at: string
          os: string | null
          referrer: string | null
          state: string | null
          timezone: string | null
          updated_at: string
          user_agent: string | null
          visitor_id: string
          workspace_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          first_seen_at?: string
          id?: string
          landing_page?: string | null
          language?: string | null
          last_seen_at?: string
          os?: string | null
          referrer?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string
          user_agent?: string | null
          visitor_id: string
          workspace_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          first_seen_at?: string
          id?: string
          landing_page?: string | null
          language?: string | null
          last_seen_at?: string
          os?: string | null
          referrer?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string
          user_agent?: string | null
          visitor_id?: string
          workspace_id?: string
        }
        Relationships: []
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
      attach_public_attribution_to_lead:
        | {
            Args: { _lead_id: string; _session_id: string; _visitor_id: string }
            Returns: undefined
          }
        | {
            Args: {
              _lead_id: string
              _session_id: string
              _session_token: string
              _visitor_id: string
            }
            Returns: undefined
          }
      consume_ai_rate_limit: {
        Args: { max_requests?: number; target_user_id: string }
        Returns: boolean
      }
      consume_public_ai_session: {
        Args: {
          max_bot_requests?: number
          max_requests?: number
          target_session_id: string
          target_token: string
        }
        Returns: boolean
      }
      consume_public_session_write: {
        Args: {
          max_requests?: number
          target_session_id: string
          target_token: string
        }
        Returns: boolean
      }
      create_meta_channel_connection: {
        Args: {
          target_access_token: string
          target_display_name: string
          target_ig_user_id?: string
          target_page_id?: string
          target_phone_number_id?: string
          target_platform: string
          target_workspace_id: string
        }
        Returns: {
          created_at: string
          display_name: string
          error_message: string
          id: string
          ig_user_id: string
          meta: Json
          page_id: string
          phone_number_id: string
          platform: string
          status: string
          updated_at: string
          webhook_verified: boolean
          workspace_id: string
        }[]
      }
      delete_meta_connection: {
        Args: { target_connection_id: string }
        Returns: undefined
      }
      find_meta_connection: {
        Args: {
          _page_id?: string
          _phone_number_id?: string
          _platform: string
        }
        Returns: {
          id: string
          status: string
          workspace_id: string
        }[]
      }
      get_public_bot: { Args: { _slug: string }; Returns: Json }
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
      list_meta_channel_connections: {
        Args: { target_workspace_id: string }
        Returns: {
          created_at: string
          display_name: string
          error_message: string
          id: string
          ig_user_id: string
          meta: Json
          page_id: string
          phone_number_id: string
          platform: string
          status: string
          updated_at: string
          webhook_verified: boolean
          workspace_id: string
        }[]
      }
      mark_meta_connection_verified: {
        Args: { target_connection_id: string }
        Returns: undefined
      }
      publish_bot: {
        Args: {
          _bot_id: string
          _note?: string
          _slug?: string
          _snapshot: Json
        }
        Returns: {
          channel: string
          conversations_count: number
          conversions_count: number
          created_at: string
          description: string
          id: string
          name: string
          published_at: string | null
          published_snapshot: Json | null
          published_version_id: string | null
          slug: string | null
          status: Database["public"]["Enums"]["bot_status"]
          updated_at: string
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "bots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_public_attribution:
        | {
            Args: {
              _fbclid?: string
              _gclid?: string
              _landing_page?: string
              _msclkid?: string
              _referrer?: string
              _session_id: string
              _session_token: string
              _ttclid?: string
              _utm_campaign?: string
              _utm_content?: string
              _utm_medium?: string
              _utm_source?: string
              _utm_term?: string
              _visitor_id: string
            }
            Returns: string
          }
        | {
            Args: {
              _fbclid?: string
              _gclid?: string
              _landing_page?: string
              _msclkid?: string
              _referrer?: string
              _session_id?: string
              _slug: string
              _ttclid?: string
              _utm_campaign?: string
              _utm_content?: string
              _utm_medium?: string
              _utm_source?: string
              _utm_term?: string
              _visitor_id: string
            }
            Returns: string
          }
      record_public_event:
        | {
            Args: {
              _block_key?: string
              _payload?: Json
              _session_id: string
              _session_token: string
              _type: string
            }
            Returns: undefined
          }
        | {
            Args: {
              _block_key?: string
              _payload?: Json
              _session_id: string
              _type: string
            }
            Returns: undefined
          }
      record_public_lead:
        | {
            Args: {
              _company?: string
              _email?: string
              _name: string
              _phone?: string
              _score?: number
              _session_id: string
              _tags?: string[]
            }
            Returns: string
          }
        | {
            Args: {
              _company?: string
              _email?: string
              _name: string
              _phone?: string
              _score?: number
              _session_id: string
              _session_token: string
              _tags?: string[]
            }
            Returns: string
          }
      record_public_message:
        | {
            Args: {
              _block_key?: string
              _role: string
              _session_id: string
              _text: string
            }
            Returns: undefined
          }
        | {
            Args: {
              _block_key?: string
              _role: string
              _session_id: string
              _session_token: string
              _text: string
            }
            Returns: undefined
          }
      record_public_session: {
        Args: { _slug: string; _variables?: Json; _visitor_id: string }
        Returns: string
      }
      record_public_session_with_ai_token: {
        Args: { _slug: string; _variables?: Json; _visitor_id: string }
        Returns: {
          ai_token: string
          session_id: string
        }[]
      }
      record_public_visitor_profile:
        | {
            Args: {
              _browser?: string
              _device_type?: string
              _landing_page?: string
              _language?: string
              _os?: string
              _referrer?: string
              _session_id: string
              _session_token: string
              _timezone?: string
              _user_agent?: string
              _visitor_id: string
            }
            Returns: string
          }
        | {
            Args: {
              _browser?: string
              _device_type?: string
              _landing_page?: string
              _language?: string
              _os?: string
              _referrer?: string
              _slug: string
              _timezone?: string
              _user_agent?: string
              _visitor_id: string
            }
            Returns: string
          }
      set_meta_connection_status: {
        Args: {
          target_connection_id: string
          target_error_message?: string
          target_status: string
        }
        Returns: undefined
      }
      slugify: { Args: { _input: string }; Returns: string }
      store_meta_inbound: {
        Args: {
          _connection_id: string
          _contact_external_id: string
          _contact_name: string
          _external_convo_id: string
          _external_message_id: string
          _message_text: string
          _message_type: string
          _platform: string
          _raw_payload?: Json
          _sent_at: string
        }
        Returns: string
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

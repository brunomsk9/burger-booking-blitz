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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      "[whatsapp][cadastro_de_clientes]": {
        Row: {
          atendimento: string | null
          chatID: string | null
          historicoConversa: string | null
          nomeCompleto: string | null
          statusLembrete: string | null
          whatsApp: string
        }
        Insert: {
          atendimento?: string | null
          chatID?: string | null
          historicoConversa?: string | null
          nomeCompleto?: string | null
          statusLembrete?: string | null
          whatsApp: string
        }
        Update: {
          atendimento?: string | null
          chatID?: string | null
          historicoConversa?: string | null
          nomeCompleto?: string | null
          statusLembrete?: string | null
          whatsApp?: string
        }
        Relationships: []
      }
      "[whatsapp][mensagens_temporarias]": {
        Row: {
          chatID: string | null
          created_at: string
          id: number
          mensagens: string | null
        }
        Insert: {
          chatID?: string | null
          created_at?: string
          id?: number
          mensagens?: string | null
        }
        Update: {
          chatID?: string | null
          created_at?: string
          id?: number
          mensagens?: string | null
        }
        Relationships: []
      }
      franchises: {
        Row: {
          accent_color: string | null
          active: boolean
          address: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          logo_url: string | null
          manager_name: string | null
          name: string
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          slug: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          accent_color?: string | null
          active?: boolean
          address?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          manager_name?: string | null
          name: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          accent_color?: string | null
          active?: boolean
          address?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          manager_name?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          avaliacao: string | null
          birthday: boolean | null
          birthday_person_name: string | null
          characters: string | null
          created_at: string | null
          created_by: string | null
          customer_name: string
          date_time: string
          franchise_name: string
          id: string
          people: number
          phone: string
          status: string
          status_lembrete_whatsapp: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          avaliacao?: string | null
          birthday?: boolean | null
          birthday_person_name?: string | null
          characters?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_name: string
          date_time: string
          franchise_name: string
          id?: string
          people: number
          phone: string
          status?: string
          status_lembrete_whatsapp?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          avaliacao?: string | null
          birthday?: boolean | null
          birthday_person_name?: string | null
          characters?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_name?: string
          date_time?: string
          franchise_name?: string
          id?: string
          people?: number
          phone?: string
          status?: string
          status_lembrete_whatsapp?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      user_franchises: {
        Row: {
          created_at: string | null
          franchise_id: string | null
          franchise_name: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          franchise_id?: string | null
          franchise_name: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          franchise_id?: string | null
          franchise_name?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_franchises_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_franchises_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_chats: {
        Row: {
          archived: boolean | null
          chat_id: string
          created_at: string | null
          customer_name: string | null
          customer_phone: string
          franchise_id: string
          id: string
          last_agent_message_time: string | null
          last_message_time: string | null
          unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          archived?: boolean | null
          chat_id: string
          created_at?: string | null
          customer_name?: string | null
          customer_phone: string
          franchise_id: string
          id?: string
          last_agent_message_time?: string | null
          last_message_time?: string | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          archived?: boolean | null
          chat_id?: string
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string
          franchise_id?: string
          id?: string
          last_agent_message_time?: string | null
          last_message_time?: string | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_chats_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          chat_id: string
          created_at: string | null
          customer_name: string | null
          customer_phone: string
          direction: string
          franchise_id: string
          id: string
          message_id: string | null
          message_text: string
          read: boolean | null
          status: string | null
          timestamp: string
        }
        Insert: {
          chat_id: string
          created_at?: string | null
          customer_name?: string | null
          customer_phone: string
          direction: string
          franchise_id: string
          id?: string
          message_id?: string | null
          message_text: string
          read?: boolean | null
          status?: string | null
          timestamp?: string
        }
        Update: {
          chat_id?: string
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string
          direction?: string
          franchise_id?: string
          id?: string
          message_id?: string | null
          message_text?: string
          read?: boolean | null
          status?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_quick_replies: {
        Row: {
          created_at: string
          franchise_id: string
          id: string
          message: string
          shortcut: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          franchise_id: string
          id?: string
          message: string
          shortcut?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          franchise_id?: string
          id?: string
          message?: string
          shortcut?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_quick_replies_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_slug: { Args: { text_input: string }; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      user_has_franchise_access: {
        Args: { franchise_name_param: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

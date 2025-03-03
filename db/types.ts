export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      chase: {
        Row: {
          communication: Database["public"]["Enums"]["chase_communication"][]
          created_at: string
          id: string
          invoice_id: string
          person_id: string
          prompt: string | null
          status: Database["public"]["Enums"]["chase_status"]
          tone: Database["public"]["Enums"]["chase_tone"]
          updated_at: string
        }
        Insert: {
          communication?: Database["public"]["Enums"]["chase_communication"][]
          created_at?: string
          id?: string
          invoice_id: string
          person_id: string
          prompt?: string | null
          status: Database["public"]["Enums"]["chase_status"]
          tone: Database["public"]["Enums"]["chase_tone"]
          updated_at?: string
        }
        Update: {
          communication?: Database["public"]["Enums"]["chase_communication"][]
          created_at?: string
          id?: string
          invoice_id?: string
          person_id?: string
          prompt?: string | null
          status?: Database["public"]["Enums"]["chase_status"]
          tone?: Database["public"]["Enums"]["chase_tone"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chase_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chase_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      company: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_call: {
        Row: {
          audio_path: string | null
          chase_id: string
          created_at: string
          execution_date: string
          from_person: string
          id: string
          length: number | null
          status: Database["public"]["Enums"]["call_status"]
          summary: string
          to_person: string
          transcript: string | null
          updated_at: string
        }
        Insert: {
          audio_path?: string | null
          chase_id: string
          created_at?: string
          execution_date?: string
          from_person: string
          id?: string
          length?: number | null
          status: Database["public"]["Enums"]["call_status"]
          summary: string
          to_person: string
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          audio_path?: string | null
          chase_id?: string
          created_at?: string
          execution_date?: string
          from_person?: string
          id?: string
          length?: number | null
          status?: Database["public"]["Enums"]["call_status"]
          summary?: string
          to_person?: string
          transcript?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_call_chase_id_fkey"
            columns: ["chase_id"]
            isOneToOne: false
            referencedRelation: "chase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_call_from_person_fkey"
            columns: ["from_person"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_call_to_person_fkey"
            columns: ["to_person"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      event_email: {
        Row: {
          attachments: string[]
          chase_id: string
          content: string
          created_at: string
          execution_date: string
          from_person: string
          id: string
          status: Database["public"]["Enums"]["email_status"]
          subject: string
          summary: string
          to_person: string
          updated_at: string
        }
        Insert: {
          attachments?: string[]
          chase_id: string
          content: string
          created_at?: string
          execution_date?: string
          from_person?: string
          id?: string
          status: Database["public"]["Enums"]["email_status"]
          subject: string
          summary: string
          to_person?: string
          updated_at?: string
        }
        Update: {
          attachments?: string[]
          chase_id?: string
          content?: string
          created_at?: string
          execution_date?: string
          from_person?: string
          id?: string
          status?: Database["public"]["Enums"]["email_status"]
          subject?: string
          summary?: string
          to_person?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_email_chase_id_fkey"
            columns: ["chase_id"]
            isOneToOne: false
            referencedRelation: "chase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_email_from_person_fkey"
            columns: ["from_person"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_email_to_person_fkey"
            columns: ["to_person"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      event_system: {
        Row: {
          chase_id: string
          created_at: string
          execution_date: string
          id: string
          summary: string
          updated_at: string
        }
        Insert: {
          chase_id: string
          created_at?: string
          execution_date?: string
          id?: string
          summary: string
          updated_at?: string
        }
        Update: {
          chase_id?: string
          created_at?: string
          execution_date?: string
          id?: string
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_system_chase_id_fkey"
            columns: ["chase_id"]
            isOneToOne: false
            referencedRelation: "chase"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice: {
        Row: {
          amount: number
          created_at: string
          currency: string
          due_date: string
          file_path: string | null
          from_company_id: string
          id: string
          service_description: string
          to_company_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          due_date: string
          file_path?: string | null
          from_company_id: string
          id?: string
          service_description: string
          to_company_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          due_date?: string
          file_path?: string | null
          from_company_id?: string
          id?: string
          service_description?: string
          to_company_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_from_company_id_fkey"
            columns: ["from_company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_to_company_id_fkey"
            columns: ["to_company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      notification: {
        Row: {
          created_at: string
          event_call_id: string | null
          event_email_id: string | null
          event_system_id: string | null
          id: string
          person_id: string
          read_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_call_id?: string | null
          event_email_id?: string | null
          event_system_id?: string | null
          id?: string
          person_id: string
          read_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_call_id?: string | null
          event_email_id?: string | null
          event_system_id?: string | null
          id?: string
          person_id?: string
          read_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_event_call_id_fkey"
            columns: ["event_call_id"]
            isOneToOne: false
            referencedRelation: "event_call"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_event_email_id_fkey"
            columns: ["event_email_id"]
            isOneToOne: false
            referencedRelation: "event_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_event_system_id_fkey"
            columns: ["event_system_id"]
            isOneToOne: false
            referencedRelation: "event_system"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      person: {
        Row: {
          company_id: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      format_chase_status: {
        Args: {
          status: Database["public"]["Enums"]["chase_status"]
        }
        Returns: string
      }
      get_chases_with_events: {
        Args: {
          chase_id_param?: string
        }
        Returns: Database["public"]["CompositeTypes"]["chase_with_events"][]
      }
      get_notifications: {
        Args: {
          user_id_param?: string
        }
        Returns: {
          id: string
          person_id: string
          read_at: string
          created_at: string
          updated_at: string
          event_type: string
          company_name: string
          email_event: Database["public"]["CompositeTypes"]["event_email_data"]
          call_event: Database["public"]["CompositeTypes"]["event_call_data"]
          system_event: Database["public"]["CompositeTypes"]["event_system_data"]
        }[]
      }
      get_user_data: {
        Args: {
          user_id: string
        }
        Returns: Database["public"]["CompositeTypes"]["person_with_company"]
      }
    }
    Enums: {
      call_status: "scheduled" | "missed" | "completed" | "voicemail"
      chase_communication: "phone" | "email"
      chase_status: "draft" | "ongoing" | "payment_pending" | "paid" | "action_required"
      chase_tone: "friendly" | "relaxed" | "firm" | "passive_agressive"
      email_status: "scheduled" | "sent" | "opened" | "replied"
    }
    CompositeTypes: {
      chase_event: {
        event_type: string | null
        email_event: Database["public"]["CompositeTypes"]["event_email_data"] | null
        call_event: Database["public"]["CompositeTypes"]["event_call_data"] | null
        system_event: Database["public"]["CompositeTypes"]["event_system_data"] | null
      }
      chase_with_events: {
        id: string | null
        invoice: Database["public"]["CompositeTypes"]["invoice_data"] | null
        person: Database["public"]["CompositeTypes"]["person_data"] | null
        status: Database["public"]["Enums"]["chase_status"] | null
        prompt: string | null
        tone: Database["public"]["Enums"]["chase_tone"] | null
        communication: Database["public"]["Enums"]["chase_communication"][] | null
        created_at: string | null
        updated_at: string | null
        events: Database["public"]["CompositeTypes"]["chase_event"][] | null
      }
      company_data: {
        id: string | null
        name: string | null
        created_at: string | null
        updated_at: string | null
      }
      event_call_data: {
        id: string | null
        chase_id: string | null
        from_person: Database["public"]["CompositeTypes"]["person_data"] | null
        to_person: Database["public"]["CompositeTypes"]["person_data"] | null
        status: Database["public"]["Enums"]["call_status"] | null
        length: number | null
        transcript: string | null
        audio_path: string | null
        summary: string | null
        execution_date: string | null
        created_at: string | null
      }
      event_email_data: {
        id: string | null
        chase_id: string | null
        from_person: Database["public"]["CompositeTypes"]["person_data"] | null
        to_person: Database["public"]["CompositeTypes"]["person_data"] | null
        subject: string | null
        content: string | null
        attachments: string[] | null
        status: Database["public"]["Enums"]["email_status"] | null
        summary: string | null
        execution_date: string | null
        created_at: string | null
      }
      event_system_data: {
        id: string | null
        chase_id: string | null
        summary: string | null
        execution_date: string | null
        created_at: string | null
      }
      invoice_data: {
        id: string | null
        from_company: Database["public"]["CompositeTypes"]["company_data"] | null
        to_company: Database["public"]["CompositeTypes"]["company_data"] | null
        currency: string | null
        amount: number | null
        service_description: string | null
        due_date: string | null
        file_path: string | null
        created_at: string | null
        updated_at: string | null
      }
      person_data: {
        id: string | null
        first_name: string | null
        last_name: string | null
        company_id: string | null
        email: string | null
        phone: string | null
        created_at: string | null
        updated_at: string | null
      }
      person_with_company: {
        id: string | null
        email: string | null
        phone: string | null
        created_at: string | null
        updated_at: string | null
        first_name: string | null
        last_name: string | null
        company: Database["public"]["CompositeTypes"]["company_data"] | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"]) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

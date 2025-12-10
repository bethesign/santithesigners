export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          city: string | null
          role: 'user' | 'admin'
          has_uploaded_gift: boolean
          shipping_address_street: string | null
          shipping_address_city: string | null
          shipping_address_zip: string | null
          shipping_address_province: string | null
          shipping_address_notes: string | null
          is_shipping_address_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          city?: string | null
          role?: 'user' | 'admin'
          has_uploaded_gift?: boolean
          shipping_address_street?: string | null
          shipping_address_city?: string | null
          shipping_address_zip?: string | null
          shipping_address_province?: string | null
          shipping_address_notes?: string | null
          is_shipping_address_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          city?: string | null
          role?: 'user' | 'admin'
          has_uploaded_gift?: boolean
          shipping_address_street?: string | null
          shipping_address_city?: string | null
          shipping_address_zip?: string | null
          shipping_address_province?: string | null
          shipping_address_notes?: string | null
          is_shipping_address_complete?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      gifts: {
        Row: {
          id: string
          user_id: string
          type: 'digital' | 'physical'
          title: string
          keyword: string | null
          url: string | null
          file_path: string | null
          photo_url: string | null
          message: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'digital' | 'physical'
          title: string
          keyword?: string | null
          url?: string | null
          file_path?: string | null
          photo_url?: string | null
          message?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'digital' | 'physical'
          title?: string
          keyword?: string | null
          url?: string | null
          file_path?: string | null
          photo_url?: string | null
          message?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quiz_questions: {
        Row: {
          id: string
          question_text: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          question_text: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          question_text?: string
          is_active?: boolean
          created_at?: string
        }
      }
      quiz_answers: {
        Row: {
          id: string
          user_id: string
          question_id: string
          answer: string
          answered_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          answer: string
          answered_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          answer?: string
          answered_at?: string
        }
      }
      extraction: {
        Row: {
          id: string
          user_id: string
          receiver_id: string
          order_position: number
          revealed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          receiver_id: string
          order_position: number
          revealed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          receiver_id?: string
          order_position?: number
          revealed_at?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: number
          gifts_start_date: string | null
          gifts_deadline: string
          quiz_available_date: string | null
          extraction_available_date: string | null
          draw_enabled: boolean
          draw_started: boolean
          current_turn: number
          extraction_generated_at: string | null
          extraction_started_at: string | null
          extraction_completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          gifts_start_date?: string | null
          gifts_deadline: string
          quiz_available_date?: string | null
          extraction_available_date?: string | null
          draw_enabled?: boolean
          draw_started?: boolean
          current_turn?: number
          extraction_generated_at?: string | null
          extraction_started_at?: string | null
          extraction_completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          gifts_start_date?: string | null
          gifts_deadline?: string
          quiz_available_date?: string | null
          extraction_available_date?: string | null
          draw_enabled?: boolean
          draw_started?: boolean
          current_turn?: number
          extraction_generated_at?: string | null
          extraction_started_at?: string | null
          extraction_completed_at?: string | null
          updated_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string
          rating: number | null
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rating?: number | null
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          rating?: number | null
          comment?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

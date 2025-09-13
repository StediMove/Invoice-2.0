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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      app_projects: {
        Row: {
          app_config: Json | null
          app_type: string | null
          created_at: string
          description: string | null
          expo_snack_id: string | null
          generated_prompt: string | null
          id: string
          name: string
          package_config: Json | null
          platform: string
          status: string
          theme_config: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          app_config?: Json | null
          app_type?: string | null
          created_at?: string
          description?: string | null
          expo_snack_id?: string | null
          generated_prompt?: string | null
          id?: string
          name: string
          package_config?: Json | null
          platform?: string
          status?: string
          theme_config?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          app_config?: Json | null
          app_type?: string | null
          created_at?: string
          description?: string | null
          expo_snack_id?: string | null
          generated_prompt?: string | null
          id?: string
          name?: string
          package_config?: Json | null
          platform?: string
          status?: string
          theme_config?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_templates: {
        Row: {
          base_prompt: string
          category: string
          created_at: string
          description: string
          id: string
          is_featured: boolean | null
          name: string
          popularity_score: number | null
          template_files: Json
          thumbnail_url: string | null
        }
        Insert: {
          base_prompt: string
          category: string
          created_at?: string
          description: string
          id?: string
          is_featured?: boolean | null
          name: string
          popularity_score?: number | null
          template_files?: Json
          thumbnail_url?: string | null
        }
        Update: {
          base_prompt?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_featured?: boolean | null
          name?: string
          popularity_score?: number | null
          template_files?: Json
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      audio_content: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          file_path: string
          id: string
          is_premium: boolean | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_path: string
          id?: string
          is_premium?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_path?: string
          id?: string
          is_premium?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_content_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_tracks: {
        Row: {
          audio_url: string
          category: string
          created_at: string | null
          description: string | null
          duration: number
          id: string
          thumbnail: string
          title: string
          updated_at: string | null
        }
        Insert: {
          audio_url: string
          category: string
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          thumbnail: string
          title: string
          updated_at?: string | null
        }
        Update: {
          audio_url?: string
          category?: string
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          thumbnail?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      generation_history: {
        Row: {
          ai_response: string
          created_at: string
          generated_files: Json | null
          generation_model: string | null
          id: string
          project_id: string
          tokens_used: number | null
          user_message: string
        }
        Insert: {
          ai_response: string
          created_at?: string
          generated_files?: Json | null
          generation_model?: string | null
          id?: string
          project_id: string
          tokens_used?: number | null
          user_message: string
        }
        Update: {
          ai_response?: string
          created_at?: string
          generated_files?: Json | null
          generation_model?: string | null
          id?: string
          project_id?: string
          tokens_used?: number | null
          user_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "app_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_usage: {
        Row: {
          created_at: string
          generation_count: number
          id: string
          month_year: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generation_count?: number
          id?: string
          month_year: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generation_count?: number
          id?: string
          month_year?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_customers: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          default_tax_rate: number | null
          email: string | null
          id: string
          name: string
          notes: string | null
          payment_terms: number | null
          phone: string | null
          postal_code: string | null
          preferred_currency: string | null
          tax_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          default_tax_rate?: number | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          preferred_currency?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          default_tax_rate?: number | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          preferred_currency?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invoice_templates: {
        Row: {
          color_scheme: string | null
          created_at: string | null
          font_family: string | null
          footer_text: string | null
          header_text: string | null
          id: string
          is_default: boolean | null
          logo_url: string | null
          name: string
          template_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color_scheme?: string | null
          created_at?: string | null
          font_family?: string | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name: string
          template_data: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color_scheme?: string | null
          created_at?: string | null
          font_family?: string | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name?: string
          template_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      job_messages: {
        Row: {
          attachment_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          job_id: string
          message: string
          message_type: string | null
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          job_id: string
          message: string
          message_type?: string | null
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          job_id?: string
          message?: string
          message_type?: string | null
          sender_id?: string
        }
        Relationships: []
      }
      job_requests: {
        Row: {
          created_at: string | null
          id: string
          job_id: string
          message: string | null
          provider_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id: string
          message?: string | null
          provider_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string
          message?: string | null
          provider_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_requests_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          budget: string | null
          category: string
          connected_at: string | null
          created_at: string | null
          customer_id: string
          description: string
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          photos: string[] | null
          service_provider_id: string | null
          status: string
          title: string
          updated_at: string | null
          urgency: string
        }
        Insert: {
          budget?: string | null
          category: string
          connected_at?: string | null
          created_at?: string | null
          customer_id: string
          description: string
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          photos?: string[] | null
          service_provider_id?: string | null
          status?: string
          title: string
          updated_at?: string | null
          urgency: string
        }
        Update: {
          budget?: string | null
          category?: string
          connected_at?: string | null
          created_at?: string | null
          customer_id?: string
          description?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          photos?: string[] | null
          service_provider_id?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      listening_history: {
        Row: {
          completed: boolean | null
          content_id: string | null
          duration_listened: number | null
          id: string
          listened_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          content_id?: string | null
          duration_listened?: number | null
          id?: string
          listened_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          content_id?: string | null
          duration_listened?: number | null
          id?: string
          listened_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listening_history_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "audio_content"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          job_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          job_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          job_id?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_items: {
        Row: {
          content_id: string | null
          created_at: string | null
          id: string
          playlist_id: string | null
          position: number
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          id?: string
          playlist_id?: string | null
          position: number
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          id?: string
          playlist_id?: string | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "audio_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_tracks: {
        Row: {
          created_at: string | null
          id: string
          playlist_id: string
          position: number
          track_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          playlist_id: string
          position: number
          track_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          playlist_id?: string
          position?: number
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "user_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "audio_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string | null
          id: string
          is_queue: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_queue?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_queue?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accent_color: string | null
          avatar_url: string | null
          business_address: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          logo_url: string | null
          phone: string | null
          preferred_currency: string | null
          preferred_language: string | null
          primary_color: string | null
          secondary_color: string | null
          tax_id: string | null
          text_color: string | null
          timezone: string | null
          total_listening_time: number | null
          updated_at: string | null
          user_type: string | null
          website: string | null
        }
        Insert: {
          accent_color?: string | null
          avatar_url?: string | null
          business_address?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          logo_url?: string | null
          phone?: string | null
          preferred_currency?: string | null
          preferred_language?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          tax_id?: string | null
          text_color?: string | null
          timezone?: string | null
          total_listening_time?: number | null
          updated_at?: string | null
          user_type?: string | null
          website?: string | null
        }
        Update: {
          accent_color?: string | null
          avatar_url?: string | null
          business_address?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          preferred_currency?: string | null
          preferred_language?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          tax_id?: string | null
          text_color?: string | null
          timezone?: string | null
          total_listening_time?: number | null
          updated_at?: string | null
          user_type?: string | null
          website?: string | null
        }
        Relationships: []
      }
      project_files: {
        Row: {
          content: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_generated: boolean | null
          project_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          is_generated?: boolean | null
          project_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_generated?: boolean | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "app_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string
          id: string
          job_id: string
          provider_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          job_id: string
          provider_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          job_id?: string
          provider_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "ratings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          job_id: string
          rating: number
          response: string | null
          reviewee_id: string
          reviewer_id: string
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          job_id: string
          rating: number
          response?: string | null
          reviewee_id: string
          reviewer_id: string
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          job_id?: string
          rating?: number
          response?: string | null
          reviewee_id?: string
          reviewer_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          name_da: string
          sort_order: number | null
          typical_duration_hours: number | null
          typical_rate_max: number | null
          typical_rate_min: number | null
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_da: string
          sort_order?: number | null
          typical_duration_hours?: number | null
          typical_rate_max?: number | null
          typical_rate_min?: number | null
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_da?: string
          sort_order?: number | null
          typical_duration_hours?: number | null
          typical_rate_max?: number | null
          typical_rate_min?: number | null
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          availability_schedule: Json | null
          business_address: string | null
          business_description: string | null
          business_lat: number | null
          business_lng: number | null
          certifications: string[] | null
          company_name: string
          coverage_radius: number | null
          created_at: string | null
          cvr_number: string | null
          hourly_rate_max: number | null
          hourly_rate_min: number | null
          id: string
          insurance_documents: string[] | null
          is_verified: boolean | null
          portfolio_images: string[] | null
          rating_avg: number | null
          response_time_avg: number | null
          service_categories: string[]
          total_earnings: number | null
          total_jobs: number | null
          trustpilot_rating: number | null
          trustpilot_url: string | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          website_url: string | null
          years_in_business: number | null
        }
        Insert: {
          availability_schedule?: Json | null
          business_address?: string | null
          business_description?: string | null
          business_lat?: number | null
          business_lng?: number | null
          certifications?: string[] | null
          company_name: string
          coverage_radius?: number | null
          created_at?: string | null
          cvr_number?: string | null
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id: string
          insurance_documents?: string[] | null
          is_verified?: boolean | null
          portfolio_images?: string[] | null
          rating_avg?: number | null
          response_time_avg?: number | null
          service_categories?: string[]
          total_earnings?: number | null
          total_jobs?: number | null
          trustpilot_rating?: number | null
          trustpilot_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          website_url?: string | null
          years_in_business?: number | null
        }
        Update: {
          availability_schedule?: Json | null
          business_address?: string | null
          business_description?: string | null
          business_lat?: number | null
          business_lng?: number | null
          certifications?: string[] | null
          company_name?: string
          coverage_radius?: number | null
          created_at?: string | null
          cvr_number?: string | null
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          insurance_documents?: string[] | null
          is_verified?: boolean | null
          portfolio_images?: string[] | null
          rating_avg?: number | null
          response_time_avg?: number | null
          service_categories?: string[]
          total_earnings?: number | null
          total_jobs?: number | null
          trustpilot_rating?: number | null
          trustpilot_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          website_url?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      shorts_clips: {
        Row: {
          caption_text: string | null
          created_at: string
          end_seconds: number
          id: string
          job_id: string
          metadata: Json | null
          order_index: number | null
          start_seconds: number
          title: string | null
        }
        Insert: {
          caption_text?: string | null
          created_at?: string
          end_seconds: number
          id?: string
          job_id: string
          metadata?: Json | null
          order_index?: number | null
          start_seconds: number
          title?: string | null
        }
        Update: {
          caption_text?: string | null
          created_at?: string
          end_seconds?: number
          id?: string
          job_id?: string
          metadata?: Json | null
          order_index?: number | null
          start_seconds?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shorts_clips_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "shorts_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      shorts_jobs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          options: Json | null
          public_token: string
          status: string
          transcript: Json | null
          updated_at: string
          user_id: string | null
          youtube_url: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          options?: Json | null
          public_token?: string
          status?: string
          transcript?: Json | null
          updated_at?: string
          user_id?: string | null
          youtube_url: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          options?: Json | null
          public_token?: string
          status?: string
          transcript?: Json | null
          updated_at?: string
          user_id?: string | null
          youtube_url?: string
        }
        Relationships: []
      }
      shorts_outputs: {
        Row: {
          asset_url: string | null
          clip_id: string | null
          created_at: string
          error: string | null
          id: string
          job_id: string
          metadata: Json | null
          render_provider: string | null
          status: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          asset_url?: string | null
          clip_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          job_id: string
          metadata?: Json | null
          render_provider?: string | null
          status?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          asset_url?: string | null
          clip_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          job_id?: string
          metadata?: Json | null
          render_provider?: string | null
          status?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shorts_outputs_clip_id_fkey"
            columns: ["clip_id"]
            isOneToOne: false
            referencedRelation: "shorts_clips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shorts_outputs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "shorts_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          subscription_status: string
          cancel_at_period_end: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          subscription_status?: string
          cancel_at_period_end?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          subscription_status?: string
          cancel_at_period_end?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      test: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          content_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "audio_content"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invoices: {
        Row: {
          created_at: string | null
          currency: string | null
          customer_id: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string | null
          items: Json | null
          notes: string | null
          paid_date: string | null
          payment_terms: number | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          template_id: string | null
          title: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          customer_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string | null
          items?: Json | null
          notes?: string | null
          paid_date?: string | null
          payment_terms?: number | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          template_id?: string | null
          title?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          customer_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string | null
          items?: Json | null
          notes?: string | null
          paid_date?: string | null
          payment_terms?: number | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          template_id?: string | null
          title?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "invoice_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invoices_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "invoice_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_payment_methods: {
        Row: {
          created_at: string | null
          details: Json
          id: string
          is_default: boolean | null
          name: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details: Json
          id?: string
          is_default?: boolean | null
          name: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_playlists: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          business_license: string | null
          business_license_number: string | null
          company_name: string | null
          country: string | null
          coverage_radius: number | null
          created_at: string | null
          email: string
          full_name: string
          google_id: string | null
          hourly_wage: number | null
          id: string
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          profile_picture: string | null
          service_categories: string[] | null
          trustpilot_link: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          address?: string | null
          business_license?: string | null
          business_license_number?: string | null
          company_name?: string | null
          country?: string | null
          coverage_radius?: number | null
          created_at?: string | null
          email: string
          full_name: string
          google_id?: string | null
          hourly_wage?: number | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          profile_picture?: string | null
          service_categories?: string[] | null
          trustpilot_link?: string | null
          updated_at?: string | null
          user_type: string
        }
        Update: {
          address?: string | null
          business_license?: string | null
          business_license_number?: string | null
          company_name?: string | null
          country?: string | null
          coverage_radius?: number | null
          created_at?: string | null
          email?: string
          full_name?: string
          google_id?: string | null
          hourly_wage?: number | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          profile_picture?: string | null
          service_categories?: string[] | null
          trustpilot_link?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
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

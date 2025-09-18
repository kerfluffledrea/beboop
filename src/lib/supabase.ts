import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export interface Database {
  public: {
    Tables: {
      friends: {
        Row: {
          id: string;
          requester: string;
          target: string;
          status: 'pending' | 'accepted' | 'blocked';
          created_at: string;
          accepted_at?: string;
        };
        Insert: {
          requester: string;
          target: string;
          status?: 'pending' | 'accepted' | 'blocked';
        };
      };
      user_sounds: {
        Row: {
          id: string;
          user_id: string;
          slot: number;
          label: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          slot: number;
          label: string;
        };
      };
      signals: {
        Row: {
          id: string;
          sender: string;
          receiver: string;
          slot: number;
          sent_at: string;
        };
        Insert: {
          sender: string;
          receiver: string;
          slot: number;
          sound_checksum: string;
        };
      };
      peers: {
        Row: {
          id: string;
          user_id: string;
          device_info: string;
          last_seen: string;
        };
        Insert: {
          user_id: string;
          device_info: string;
        };
      };
    };
  };
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

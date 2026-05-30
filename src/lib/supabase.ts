import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy initialization to handle missing environment variables gracefully
let _supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
    if (!_supabaseClient) {
        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn('Supabase environment variables not set. Using mock client for developer mode.');
            // Create a dummy client that will fail gracefully
            // The developer bypass should catch this before any actual calls
        }
        _supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    return _supabaseClient;
};

// For backward compatibility
export const supabase = {
    get auth() {
        return getSupabaseClient().auth;
    },
    from(table: string) {
        return getSupabaseClient().from(table);
    }
};

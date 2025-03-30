import { createClient } from "@supabase/supabase-js";

// Replace with your Supabase credentials
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xyz.supabase.co'
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


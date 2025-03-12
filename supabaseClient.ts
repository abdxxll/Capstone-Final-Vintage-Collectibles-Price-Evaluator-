import { createClient } from "@supabase/supabase-js";

// Replace with your Supabase credentials
const SUPABASE_URL = "https://exujpqavsbzrzahkfzdr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4dWpwcWF2c2J6cnphaGtmemRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1OTg3NzMsImV4cCI6MjA1NjE3NDc3M30.pBqTUEu8t_UxgDr-Cx12k_aoOh5r0sXuyigx63CAZxg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

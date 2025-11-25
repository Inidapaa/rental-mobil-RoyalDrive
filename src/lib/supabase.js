import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zzcwgvulpnrgtkvcnijy.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Y3dndnVscG5yZ3RrdmNuaWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTc3NzYsImV4cCI6MjA3OTE5Mzc3Nn0.6-f0n9fIqFc5ctduMReC4hqJaEXLUuWLJRgcZaRM6gk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

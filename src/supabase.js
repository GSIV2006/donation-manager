import { createClient } from "@supabase/supabase-js";

// Same connection format as your book-library project.
// This is the donation management project, NOT the book-library database.
const supabaseUrl = "https://koudxkytqxojgbojvvnj.supabase.co";
const supabaseKey = "sb_publishable_soAFvPh7f5lhuZ6QN1wNEg_ZyvLUbdA";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

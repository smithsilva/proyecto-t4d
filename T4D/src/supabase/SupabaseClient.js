import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nnlpmcwnahjdfqhfccjj.supabase.co";
const supabaseKey = "sb_publishable_3WU0ecokunMuTQMf6xWqLA_TrZVAZ7X";

export const supabase = createClient(supabaseUrl, supabaseKey);
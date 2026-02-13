import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jyhwnoszjpjkkabwomeg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5aHdub3N6anBqa2thYndvbWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDU4MTIsImV4cCI6MjA4NjQ4MTgxMn0.kW27vYSS-XD0lCcGAyizZqHZ44e0fxcVfoR9MphFhno";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
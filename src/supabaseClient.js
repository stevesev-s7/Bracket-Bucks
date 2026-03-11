// bust-1773202953901
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://cxkqkmakwynpgqpfzvtp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4a3FrbWFrd3lucGdxcGZ6dnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODEwMDIsImV4cCI6MjA4ODE1NzAwMn0.biNsjhSH3HcuWG9q25XO5CRpiTkdmpF59iLAOCk8yUE';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

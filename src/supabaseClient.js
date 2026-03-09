import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://cxkqkmakwynpgqpfzvtp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4a3FrbWFrd3lucGdxcGZ6dnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzM1MDksImV4cCI6MjA1NzA0OTUwOX0.5fE5R_e5bBgzBP6VJqPiJRJZRMqmkkVKAWcZDyBNzV4';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

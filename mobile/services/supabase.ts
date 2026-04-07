import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yttoyacpafnmbmkewprc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dG95YWNwYWZubWJta2V3cHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDgzMzIsImV4cCI6MjA5MTA4NDMzMn0.Qe3Uzar4ktx2TCrRQjjMU2iODC42Wk7JkIHMfCMJuBo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

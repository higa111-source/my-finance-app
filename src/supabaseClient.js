import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fxfrdomzvehxfgnaboqu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZnJkb216dmVoeGZnbmFib3F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Nzg2OTQsImV4cCI6MjA3MTI1NDY5NH0.pR1htU-_rG4cLkWVxA-bNEx_z5LHN2F4NLN3ezwObh4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
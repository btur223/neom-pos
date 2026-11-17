import { createClient } from '@supabase/supabase-js'

const url = 'https://supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdGhsdWt4bW91YXhvdm1za21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NzE0MzUsImV4cCI6MjExMDM0NzQzNX0.LoGbfTn4tgbM8z2G_Rd2GiVhH2Qt-VHxM4uiDBqLq9g'

export const supabase = createClient(url, key)

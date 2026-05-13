import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://ifimawfcqooucjktmcop.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmaW1hd2ZjcW9vdWNqa3RtY29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDE1NjgsImV4cCI6MjA5NDAxNzU2OH0.raP0m4Rqj8wVmJ-q43BvQFbOhOnP5zAleDabVehwyVM'
)

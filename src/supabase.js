import { createClient } from '@supabase/supabase-js'

// Ces deux informations font le pont direct avec ton projet Supabase
const supabaseUrl = 'https://lbfafephisdjvngzdnle.supabase.co'
const supabaseAnonKey = 'sb_publishable_oiCJVptloZEANvxK6TpI5g_sK8-hlTf'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
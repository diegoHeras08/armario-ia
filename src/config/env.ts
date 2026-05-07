export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

export const isSupabaseEnvConfigured =
  env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0;
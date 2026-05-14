export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',

  geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '',
  geminiTryOnModel:
    process.env.EXPO_PUBLIC_GEMINI_TRYON_MODEL ??
    'gemini-3.1-flash-image-preview',
};

export const isSupabaseEnvConfigured =
  env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0;

export const isGeminiEnvConfigured = env.geminiApiKey.length > 0;
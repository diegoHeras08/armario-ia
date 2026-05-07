import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { env, isSupabaseEnvConfigured } from '../config/env';

export const supabase = isSupabaseEnvConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey)
  : null;

export function isSupabaseConfigured(): boolean {
  return isSupabaseEnvConfigured;
}
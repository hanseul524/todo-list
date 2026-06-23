import { createClient } from "@supabase/supabase-js"
import * as SecureStore from "expo-secure-store"

// @MX:ANCHOR: [AUTO] Supabase client - fan_in >= 3, used by all feature API modules
// @MX:REASON: Central auth-aware client used across all feature layers

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // CRITICAL: false for React Native
    },
  }
)
